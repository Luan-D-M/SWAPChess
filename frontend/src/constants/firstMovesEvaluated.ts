import type { EvaluatedMove } from "@/types/evaluatedMove";

export const FirstMoveEvaluated: Record<string, EvaluatedMove> = {
    a3: { 
            move: 'a2a3',
            evaluation: -0.1
        },
    a4: { 
            move: 'a2a4',
            evaluation: -0.2
        },
    b3: { 
            move: 'b2b3',
            evaluation: 0.0
        },
    b4: { 
            move: 'b2b4',
            evaluation: -0.1
        },
    c3 : { 
            move: 'c2c3',
            evaluation: 0.0        
        },
    c4 : { 
            move: 'c2c4',
            evaluation: 0.1
        },
    d3 : { 
            move: 'd2d3',
            evaluation: -0.1
        },
    d4 : { 
            move: 'd2d4',
            evaluation: 0.2
        },
    e3 : { 
            move: 'e2e3',
            evaluation: 0.0
        },
    e4 : { 
            move: 'e2e4',
            evaluation: 0.2
        },
    f3 : { 
            move: 'f2f3',
            evaluation: -0.6
        },
    f4 : { 
            move: 'f2f4',
            evaluation: -0.2
        },
    g3 : { 
            move: 'g2g3',
            evaluation: 0.1
        },
    g4 : { 
            move: 'g2g4',
            evaluation: -0.9
        },
    h3: { 
            move: 'h2h3',
            evaluation: 0.0
        },
    h4: { 
            move: 'h2h4',
            evaluation: -0.4
        },
    Na3: { 
            move: 'b1a3',
            evaluation: -0.3
        },
    Nc3: { 
            move: 'b1c3',
            evaluation: 0.0
        },
    Nf3: { 
            move: 'g1f3',
            evaluation: 0.1
        },
    Nh3: { 
            move: 'g1h3',
            evaluation: -0.4
        },
}
