import React from 'react';
import { AbsoluteFill, Audio, staticFile } from 'remotion';
import { useT, tw, E } from './lib.js';
import { S } from './timeline.js';
import { Background } from './Background.jsx';
import { Intro } from './Intro.jsx';
import { PhoneStory, AdCaptions, ProfilePanel } from './Story.jsx';
import { CrmScene } from './CrmScene.jsx';
import { Outro } from './Outro.jsx';

export const Film = () => {
  const t = useT();
  // the aurora dims behind the product UI, and swells for the title cards
  const dim = tw(t, S.zoom, S.zoom + 2, 0, 1, E.inOut) * (1 - tw(t, S.outro - 0.2, S.outro + 1.4, 0, 1, E.inOut));
  return (
    <AbsoluteFill>
      <Audio src={staticFile('soundtrack.wav')} />
      <Background t={t} dim={dim} />
      <Intro t={t} />
      <AdCaptions t={t} />
      <ProfilePanel t={t} />
      <PhoneStory t={t} />
      <CrmScene t={t} />
      <Outro t={t} />
    </AbsoluteFill>
  );
};
