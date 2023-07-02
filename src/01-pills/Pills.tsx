import React, {MutableRefObject, useLayoutEffect, useState} from 'react';
import {PillData} from './data';
import {Pill} from './Pill';
import _ from "lodash";

interface PillsProps {
    pills: PillData[];
    headers: string[]; // ids of pills that are toggled on
    toggleHeader: (id: string) => void;
}

interface LayoutBreakElement {
    index: string;
    type: 'line-break';
}

interface LayoutPillElement {
    index: string;
    type: 'pill';
    pill: PillData;
}

type LayoutElement = LayoutBreakElement | LayoutPillElement;

/*
  1. Get width of toggled on pills
  2. Get width of container (minus padding)
  3. Get pills that sum up the closest to container width
 */

type ComputationalPill = {
    width: number;
    pill: PillData;
}

// this const could be also retrieved with a ref but it is constant here so I just defined it
const TOGGLED_ON_PILLS_WIDTH = 24

const useWindowWidth = () => {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    const handleResize = _.throttle(() => {
        setWindowWidth(window.innerWidth);
    }, 100);

    useLayoutEffect(() => {
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return windowWidth;
};

type PillRefsType = { [id: PillData['id']]: HTMLDivElement };

export function Pills({pills, headers, toggleHeader}: PillsProps) {
    const containerNode = React.useRef<HTMLDivElement>(null);
    const pillRefs = React.useRef<PillRefsType>({});
    const windowWidth= useWindowWidth();

    const [layoutElements, setLayoutElements] = React.useState<LayoutElement[]>(
        () => {
            return pills.map((pill) => ({
                index: pill.id,
                type: 'pill',
                pill: pill,
            }));
        }
    );

    // this could use useCallback for optimisations but I don't see user experience being affected by it now
    const getSortedPillWidths = (pillRefs: MutableRefObject<PillRefsType>): ComputationalPill[] => {
        return _.orderBy(
            Object.values(pillRefs.current).map((el, index) => ({
                    width: el.clientWidth + TOGGLED_ON_PILLS_WIDTH,
                    // we are casting here to PillData because we know given element always will be found in pills array
                    pill:  pills.find((pill) => pill.id === String(index + 1)) as PillData,
                })
            ), 'width', 'desc');
    }

    const getPillRows = (pillWidths: ComputationalPill[], containerWidth: number): ComputationalPill[][] => {
        return pillWidths.reduce((acc: {
            currentRow: number;
            orderedPills: ComputationalPill[][];
        }, curr) => {
            if (!acc.orderedPills[acc.currentRow]) {
                acc.orderedPills[acc.currentRow] = [];
            }

            const rowWidth = _.sum(acc.orderedPills[acc.currentRow].map((el) => el.width));

            if (rowWidth + curr.width > containerWidth) {
                acc.currentRow++;
                acc.orderedPills[acc.currentRow] = [curr];
            } else {
                acc.orderedPills[acc.currentRow].push(curr);
            }

            return acc;
        }, {
            currentRow: 0,
            orderedPills: [],
        }).orderedPills;
    }

    const transformPillsToLayoutElements = (pillRows: ComputationalPill[][]): LayoutElement[] => {
        return pillRows.reduce((acc: LayoutElement[], pillsRow, index) => {
            const pills: LayoutPillElement[] = pillsRow.map(({pill}) => ({
                index: pill.id,
                type: 'pill',
                pill: pill,
            }));

            acc = [...acc, ...pills];

            const breakElement: LayoutBreakElement = {
                index: `break-${index}`,
                type: 'line-break',
            };
            acc = [...acc, breakElement];

            return acc;
        }, []);
    }

    useLayoutEffect(() => {
        if (!containerNode.current || !pillRefs.current) return;

        const sortedPillWidthsWhenToggledOn = getSortedPillWidths(pillRefs);

        const containerWidth = containerNode.current.clientWidth;

        const pillRows = getPillRows(sortedPillWidthsWhenToggledOn, containerWidth);

        const newLayoutElements = transformPillsToLayoutElements(pillRows);

        setLayoutElements(newLayoutElements);
    }, [pills, containerNode.current, pillRefs.current, windowWidth]);

    const setPillRef = (id: PillData['id'], node: HTMLDivElement) => {
        if (node) {
            pillRefs.current[id] = node;
        }
    };

    return (
        <div ref={containerNode}>
            {layoutElements.map((el) => {
                if (el.type === 'line-break') {
                    return <br key={`__${el.type}-${el.index}`}/>;
                } else {
                    return (
                        <Pill
                            key={el.pill.id}
                            header={headers.includes(el.pill.id)}
                            onClick={() => {
                                toggleHeader(el.pill.id);
                            }}
                            ref={(element) => element && setPillRef(el.pill.id, element)}
                        >
                            {el.pill.value}
                        </Pill>
                    );
                }
            })}
        </div>
    );
}
