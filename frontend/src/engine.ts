import { type BoardApi, type PieceColor } from 'vue3-chessboard';
import { EngineDifficultyLevel } from './constants/engineDifficultyLevel';
import { FirstMoveEvaluated } from './constants/firstMovesEvaluated';
import type { EvaluatedFirstMove } from './types/evaluatedFirstMove';
import { getRandomInteger } from './utils';
import { swapMap } from './constants/swapMaps';
/* 
  https://github.com/lichess-org/stockfish.js
  https://qwerty084.github.io/vue3-chessboard-docs/stockfish.html
  UCI Protocol: https://backscattering.de/chess/uci/
*/

type SwapCallback = () => void;

export class Engine { 
  private boardApi: BoardApi | undefined;
  private engineColor: PieceColor;
  private difficulty: EngineDifficultyLevel;
  private allowSwap: SwapCallback;

  private isFirstMove = true;
  private stockfish: Worker | undefined;
  private logEngineMetadata: boolean = false;
  private thinkingTimeInMs: number = 2000;
  private initialPositionAfterComputerSwaps: string = "";
  
  public bestMove: string | null = null;
  public engineName: string | null = null;


  constructor(
    boardApi: BoardApi,
    engineColor: PieceColor,
    difficulty: EngineDifficultyLevel,
    allowSwap: SwapCallback
  ) 
  {
    this.boardApi = boardApi;
    this.engineColor = engineColor
    this.difficulty = difficulty
    this.allowSwap = allowSwap

    const wasmSupported =
        typeof WebAssembly === 'object' &&
        WebAssembly.validate(
                // This array of bytes is the smallest possible valid WebAssembly header.
            Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00),  
        );

    this.stockfish = new Worker(
      wasmSupported ? 'stockfish.wasm.js' : 'stockfish.js',
    );

    this.setupListeners();

    this.stockfish.postMessage('uci'); // UCI: Universal Chess Interface
  }

  private setupListeners(): void {
    this.stockfish?.addEventListener('message', (data) =>
      this.handleEngineStdout(data),
    );

    this.stockfish?.addEventListener('error', (err) => console.error(err));

    this.stockfish?.addEventListener('messageerror', (err) =>
      console.error(err),
    );
  }

  private handleEngineStdout(data: MessageEvent<unknown>) {

    if (this.logEngineMetadata) {
      this.logMetadata(data.data as string)
    }

    /* In UCI, if the engine receives an unknown command or token it is just ignored. */
    const uciStringSplitted = (data.data as string).split(' ');

    // Engine is ready in uci mode. 
    if (uciStringSplitted[0] === 'uciok') {

      /* Analysis Contempt: How much Stockfish wants to avoid a draw. 
         No longer avaiable in Stockfish's newer versions.
      */
      this.setOption('Analysis Contempt', 'Off');

      /*
        Stockfish 2019-08-15 64 POPCNT Multi-Variant is originally used here.
        It uses the option 'Skill Level'. Newer version uses UCI_LimitStrength
        with UCI_Elo.

        https://official-stockfish.github.io/docs/stockfish-wiki/UCI-&-Commands.html#skill-level
      */
      switch (this.difficulty) {
        case EngineDifficultyLevel.BEGINNER:
          this.setOption('Skill Level', '0');
          break;
        case EngineDifficultyLevel.EASY:
          this.setOption('Skill Level', '5');
          break;
        case EngineDifficultyLevel.INTERMEDIATE:
          this.setOption('Skill Level', '10');
          break;
        case EngineDifficultyLevel.HARD:
          this.setOption('Skill Level', '15');
          break;
        case EngineDifficultyLevel.IMPOSSIBLE:
          this.setOption('Skill Level', '20');
          break
      }

      this.stockfish?.postMessage('ucinewgame'); 
      this.stockfish?.postMessage('isready');  // Wait for the engine to be ready again.
      this.isFirstMove = true;

      return;
    }

    if (uciStringSplitted[0] === 'readyok') {    // Engine is ready.
      this.initialPositionAfterComputerSwaps = ""

      if (this.engineColor === 'white') {
        if (this.isFirstMove && 
          this.difficulty !== EngineDifficultyLevel.BEGINNER) 
          {
            this.boardApi?.move(this.chooseOpeningMove().move)
            this.allowSwap()
          } else {
            // go movetime <time>: tells the engine to analyze the position for <time> milliseconds.
            this.stockfish?.postMessage(`go movetime ${this.thinkingTimeInMs}`); 
          }  
        // After white's first move, callback informing that SWAP is now allowed.
      }
      this.isFirstMove = false    
    }

    // bestmove move1 [ ponder move2 ] --> Is how the engine communicate the best move.
    if (uciStringSplitted[0] === 'bestmove' && uciStringSplitted[1]) {
      if (uciStringSplitted[1] !== this.bestMove) {
        this.bestMove = uciStringSplitted[1];
        console.log(this.bestMove)
        if (this.boardApi?.getTurnColor() === this.engineColor) {
          // e.g: e2e4  --> means piece from e2 to e4
          this.boardApi.move(this.bestMove.slice(0, 4));
        }
        
        if (this.engineColor === 'white' && this.boardApi?.getCurrentPlyNumber() === 1) {
            this.allowSwap();
        }
      }
    }
  }

  private setOption(name: string, value: string): void {
    this.stockfish?.postMessage(`setoption name ${name} value ${value}`);
  }

  private logMetadata(data: string) {
    if (data.startsWith('id name')) {
      console.log("Found Version:", data); 
    }
    if (data.startsWith('option')) {
      console.log("Supported Option:", data);
    } 
  }

  /**
   * Arbitrary logic to define the opening move according to engine expertise level.
   * That's necessary cause engine evaluation doesn't consider the SWAP rule.
   * 
   * IMPOSSIBLE level play only the moves evaluated as '0.0' --> ideal for SWAP rule.
   * 
   * A BEGINNER doesn't even think about the SWAP rule, so that function does not apply to that level.
   */
  private chooseOpeningMove(): EvaluatedFirstMove {
    const allOpeningMoves = Object.values(FirstMoveEvaluated);
    let candidateMoves: EvaluatedFirstMove[] = [];

    switch(this.difficulty) {
      case EngineDifficultyLevel.EASY:
        candidateMoves = allOpeningMoves.filter(m => Math.abs(m.evaluation) >= 0.4);
        break;

      case EngineDifficultyLevel.INTERMEDIATE:  // Neither play the worst moves (g4,f3) neither the best ones.
        candidateMoves = allOpeningMoves.filter(m => {
          const absEvaluation = Math.abs(m.evaluation);
          return absEvaluation >= 0.2 && absEvaluation <= 0.5
        });
        break; 

      case EngineDifficultyLevel.HARD:
        candidateMoves = allOpeningMoves.filter(m => Math.abs(m.evaluation) <= 0.3);
        break;

      case EngineDifficultyLevel.IMPOSSIBLE:
        // Keep only moves evaluated as '0.0' (best strategy in SWAP scenario).
        candidateMoves = allOpeningMoves.filter(m => m.evaluation === 0.0);
        break;
    }

    const randomIndex = getRandomInteger(0, candidateMoves.length - 1)

    return candidateMoves[randomIndex]!;
  }

  private analyzeSwap(): boolean {
    let playedSwap = false

    const allOpeningMoves = Object.values(FirstMoveEvaluated);
    const currentFen = this.boardApi!.getFen()
    const playedMove = allOpeningMoves.filter((m) => m.fen === currentFen)[0]

    if (!playedMove) {
      console.log('Error occured. Played move was not found! Ignoring SWAP possibility...')
      return false 
    }

    switch (this.difficulty) {
      case EngineDifficultyLevel.BEGINNER: // Run that case for both BEGINNER and EASY.
      case EngineDifficultyLevel.EASY:
        console.log('Considering SWAP...')
        if (getRandomInteger(1,2) === 1) {
          this.playSwap()
          playedSwap = true
        }
        break;

      case EngineDifficultyLevel.INTERMEDIATE:
        console.log('Considering SWAP...')
         if (getRandomInteger(1,2) === 1) {
          if (playedMove.evaluation >= -0.3) {
            this.playSwap()
            playedSwap = true
          }
        }
        break;

      case EngineDifficultyLevel.HARD:
        console.log('Considering SWAP...')
        if (playedMove.evaluation >= -0.2) {
            this.playSwap()
            playedSwap = true
        }
        break;

      case EngineDifficultyLevel.IMPOSSIBLE:
        console.log('Considering SWAP...')
        if (playedMove.evaluation >= 0.0) {
          this.playSwap()
          playedSwap = true
        }
        break;
    }

    return playedSwap
  }

  private playSwap() {

    let newPosition = swapMap[this.boardApi!.getFen()]
    
    if (newPosition) {
      this.initialPositionAfterComputerSwaps = newPosition
      setTimeout(() => {   // Timeout needed so the animation can run.
        this.boardApi!.setPosition(newPosition);
      }, 50);
    } else {
      console.log('Error happened when handling SWAP!')
      return
    }
  }

  public sendPosition(position: string, startingPositionFEN: string) {
    /* If SWAP happened, the initial FEN is different, that's why 
    * 'position fen ${startingPositionFEN}' is used instead of 'position startpos'.
    */

    let playedSwapThisTurn = false
    if ( this.engineColor === 'black' && this.boardApi!.getCurrentPlyNumber() === 1) {
      playedSwapThisTurn = this.analyzeSwap()
    }

    if (!playedSwapThisTurn) {
      if (this.initialPositionAfterComputerSwaps !== "") {
        console.log("RUNNED")
        this.stockfish?.postMessage(`position fen ${this.initialPositionAfterComputerSwaps} moves ${position}`); 
      } else {
        this.stockfish?.postMessage(`position fen ${startingPositionFEN} moves ${position}`); 
      }
      this.stockfish?.postMessage(`go movetime ${this.thinkingTimeInMs}`);
    }
  }
}