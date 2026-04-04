import React from "react";
import { registerRoot } from "remotion";
import { Composition } from "remotion";
import {
  OsterGeschenke,
  OSTER_GESCHENKE_DURATION,
} from "../compositions/OsterGeschenke";

const Root: React.FC = () => (
  <>
    <Composition
      id="OsterGeschenke"
      component={OsterGeschenke}
      durationInFrames={OSTER_GESCHENKE_DURATION}
      fps={30}
      width={1080}
      height={1920}
    />
  </>
);

registerRoot(Root);
