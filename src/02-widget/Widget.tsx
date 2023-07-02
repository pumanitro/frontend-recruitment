import React, {useState, useRef, useEffect, useLayoutEffect, MutableRefObject} from 'react';

import './widget.css';

type MessageData = {
    frameHeight?: number;
}

export const Widget = () => {
  const [width, setWidth] = useState(0);
  // iframe should not "flicker" on initial render (showing for a fraction of second iframe with incorrect width/height)
  // before iframe is loaded then it won't be displayed - this is how I wanted to prevent flickering ()
  // also used useEffectLayout for this
  const [height, setHeight] = useState('0px');

  // developer who worked on this task left the code a bit sloppy. Try to improve it in areas like TypeScript and good React practices.
  // added some type checking instead of any
  const iframeContainer = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useLayoutEffect(() => {
    if(!iframeContainer.current) return;

    const measurements = iframeContainer.current.getBoundingClientRect();
    if (measurements) {
      setWidth(measurements.width);
    }
      const handleMessage = (event: MessageEvent<MessageData>) => {
          if (event.data.frameHeight) {
              setHeight(`${event.data.frameHeight}px`);
          }
      };

      window.addEventListener('message', handleMessage);

      const handleResize = () => {
          setWidth(iframeContainer.current?.getBoundingClientRect().width || 0);
          if (iframeRef.current && iframeRef.current.contentWindow) {
              // Send 'resize' message to iframe content
              // todo: target origin should be more secure/defined properly
              iframeRef.current.contentWindow.postMessage('resize', '*');
          }
      };

      window.addEventListener("resize", handleResize);

      return () => {
          window.removeEventListener("message", handleMessage);
          window.removeEventListener("resize", handleResize);
      };
  }, []);

  return (
    <div className="widget">
      <h1>App content</h1>
      <p>Check out our latest podcast</p>
      <div
        style={{
          width: '100%',
          overflow: 'hidden',
        }}
        ref={iframeContainer}
      >
        <iframe
          ref={iframeRef}
          height={height}
          width={width}
          src="/iframe"
          style={{ border: 0 }}
        />
      </div>
    </div>
  );
};
