import { DefinedHostColor } from "./hostColor.js"
import { TimeControl } from "./timeControl.js"

export type Timestamp = number;

export type Challenge = 
    {
        id: string,
        timeControl: TimeControl,
        hostColor: DefinedHostColor,
        createdAt: Timestamp,  // Date.now()
        colorWasRandom: boolean
    }