import React from 'react';
import { Instructions } from './Instructions';
import { Widget } from './Widget';
import './widget.css';

export const WidgetApp = () => {
  return (
    <div className="widget-app">
      <Instructions />
      <hr />
      <Widget />
    </div>
  );
};
