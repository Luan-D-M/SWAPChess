import type { EvaluatedFirstMove } from "@/types/evaluatedFirstMove";
import { FirstMove } from "./firstMoves";

export const FirstMoveEvaluated: Record<string, EvaluatedFirstMove> = {
    a3: { 
            move: 'a2a3',
            evaluation: -0.1,
            fen: FirstMove.a3
        },
    a4: { 
            move: 'a2a4',
            evaluation: -0.2,
            fen: FirstMove.a4
        },
    b3: { 
            move: 'b2b3',
            evaluation: 0.0,
            fen: FirstMove.b3
        },
    b4: { 
            move: 'b2b4',
            evaluation: -0.1,
            fen: FirstMove.b4
        },
    c3 : { 
            move: 'c2c3',
            evaluation: 0.0,
            fen: FirstMove.c3
        },
    c4 : { 
            move: 'c2c4',
            evaluation: 0.1,
            fen: FirstMove.c4
        },
    d3 : { 
            move: 'd2d3',
            evaluation: -0.1,
            fen: FirstMove.d3
        },
    d4 : { 
            move: 'd2d4',
            evaluation: 0.2,
            fen: FirstMove.d4
        },
    e3 : { 
            move: 'e2e3',
            evaluation: 0.0,
            fen: FirstMove.e3
        },
    e4 : { 
            move: 'e2e4',
            evaluation: 0.2,
            fen: FirstMove.e4
        },
    f3 : { 
            move: 'f2f3',
            evaluation: -0.6,
            fen: FirstMove.f3
        },
    f4 : { 
            move: 'f2f4',
            evaluation: -0.2,
            fen: FirstMove.f4
        },
    g3 : { 
            move: 'g2g3',
            evaluation: 0.1,
            fen: FirstMove.g3
        },
    g4 : { 
            move: 'g2g4',
            evaluation: -0.9,
            fen: FirstMove.g4
        },
    h3: { 
            move: 'h2h3',
            evaluation: 0.0,
            fen: FirstMove.h3
        },
    h4: { 
            move: 'h2h4',
            evaluation: -0.4,
            fen: FirstMove.h4
        },
    Na3: { 
            move: 'b1a3',
            evaluation: -0.3,
            fen: FirstMove.Na3
        },
    Nc3: { 
            move: 'b1c3',
            evaluation: 0.0,
            fen: FirstMove.Nc3
        },
    Nf3: { 
            move: 'g1f3',
            evaluation: 0.1,
            fen: FirstMove.Nf3
        },
    Nh3: { 
            move: 'g1h3',
            evaluation: -0.4,
            fen: FirstMove.Nh3
        },
}