import { registerRoot, Composition } from "remotion";
import React from "react";
import {
  HolzOsterhaseVideo,
  HOLZ_OSTERHASE_VIDEO_DURATION,
} from "../compositions/HolzOsterhaseVideo";

const Root: React.FC = () => (
  <Composition
    id="HolzOsterhaseVideo"
    component={HolzOsterhaseVideo}
    durationInFrames={HOLZ_OSTERHASE_VIDEO_DURATION}
    fps={30}
    width={1080}
    height={1920}
  />
);

registerRoot(Root);
