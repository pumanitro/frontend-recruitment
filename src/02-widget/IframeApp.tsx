import React, { useEffect, useRef } from "react";
import './iframe.css';

export const IframeApp = () => {
    const contentRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const sendHeightToParent = () => {
            const height = contentRef.current?.clientHeight;
            if (height) {
                // todo: target origin should be more secure/defined properly
                window.parent.postMessage({ frameHeight: height }, "*");
            }
        };

        sendHeightToParent();

        const handleParentMessage = (event: MessageEvent) => {
            if (event.data === 'resize') {
                sendHeightToParent();
            }
        };

        sendHeightToParent();
        window.addEventListener("message", handleParentMessage);

        return () => {
            window.removeEventListener("message", handleParentMessage);
        };
    }, []);

    return (
        <div
            ref={contentRef}
            /* developer who worked on this task left the code a bit sloppy. Try to improve it in areas like TypeScript and good React practices.
             Added class usage instead of inline styling
             */
            className={'iframe-widget'}
        >
            Dynamic marketing content will be here
        </div>
    );
};
