import React from "react";
import { Composition } from "remotion";
import {
  GartenmobelRenovation,
  GARTENMOEBEL_RENOVATION_DURATION,
} from "./compositions/GartenmobelRenovation";
import {
  BootDeckRenovation,
  BOOT_DECK_RENOVATION_DURATION,
} from "./compositions/BootDeckRenovation";
import {
  EiBootEinfach,
  EI_BOOT_EINFACH_DURATION,
} from "./compositions/EiBootEinfach";

// 9:16 Portrait (Instagram Reels/Shorts)
const WIDTH = 1080;
const HEIGHT = 1920;
const FPS = 30;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="GartenmobelRenovation"
        component={GartenmobelRenovation}
        durationInFrames={GARTENMOEBEL_RENOVATION_DURATION}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="BootDeckRenovation"
        component={BootDeckRenovation}
        durationInFrames={BOOT_DECK_RENOVATION_DURATION}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="EiBootEinfach"
        component={EiBootEinfach}
        durationInFrames={EI_BOOT_EINFACH_DURATION}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
    </>
  );
};
