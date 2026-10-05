import React from 'react';
import { Composition } from 'remotion';
import { Film } from './Film.jsx';
import { TOTAL } from './timeline.js';

export const Root = () => (
  <Composition
    id="Film"
    component={Film}
    width={1920}
    height={1080}
    fps={30}
    durationInFrames={Math.round(TOTAL * 30)}
    defaultProps={{ fps: 30 }}
    calculateMetadata={({ props }) => ({ fps: props.fps, durationInFrames: Math.round(TOTAL * props.fps) })}
  />
);
