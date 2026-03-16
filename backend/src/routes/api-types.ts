import { HostColor } from "../types/hostColor.js";
import { TimeControl } from "../types/timeControl.js";

export type CreateChallengeBody = {
  hostColor: HostColor;
  timeControl: TimeControl
};

export type CreateChallengeResponse = {
  challengeId: string;
};