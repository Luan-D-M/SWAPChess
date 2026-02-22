import { type BoardApi, type PieceColor } from 'vue3-chessboard';
import { type SquareKey } from 'vue3-chessboard';
import { EngineDifficultyLevel } from './constants/engineDifficultyLevel';
/* 
  https://github.com/lichess-org/stockfish.js
  https://qwerty084.github.io/vue3-chessboard-docs/stockfish.html
  UCI Protocol: https://backscattering.de/chess/uci/
*/
export class Engine { 
  private boardApi: BoardApi | undefined;
  private engineColor: PieceColor;
  private difficulty: EngineDifficultyLevel;

  private stockfish: Worker | undefined;
  private logEngineMetadata: boolean = false;
  private thinkingTimeInMs: number = 2000;

  public bestMove: string | null = null;
  public engineName: string | null = null;

  constructor(boardApi: BoardApi, engineColor: PieceColor, difficulty: EngineDifficultyLevel) {
    this.boardApi = boardApi;
    this.engineColor = engineColor
    this.difficulty = difficulty

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

      this.setOption('UCI_LimitStrength', 'true')
      switch (this.difficulty) {
        case EngineDifficultyLevel.BEGINNER:
          this.setOption('Skill Level', '0');
          this.setOption('UCI_Elo', '1000')
          break;
        case EngineDifficultyLevel.EASY:
          this.setOption('Skill Level', '5');
          this.setOption('UCI_Elo', '1400')
          break;
        case EngineDifficultyLevel.INTERMEDIATE:
          this.setOption('Skill Level', '10');
          this.setOption('UCI_Elo', '1850')
          break;
        case EngineDifficultyLevel.HARD:
          this.setOption('Skill Level', '15');
          this.setOption('UCI_Elo', '2200')
          break;
        case EngineDifficultyLevel.IMPOSSIBLE:
          this.setOption('Skill Level', '20');
          this.setOption('UCI_Elo', '3400')
          break
      }

      this.setOption('Skill Level', '0');
      /*
        This specific version of stockfish uses SkillLevel instead of UCI_LimitStrength or UCI_Elo.
        Skill Level.

        When defining difficulty, use both

        Both are specified in new versions: https://official-stockfish.github.io/docs/stockfish-wiki/UCI-&-Commands.html#skill-level
      */

      this.stockfish?.postMessage('ucinewgame'); 
      this.stockfish?.postMessage('isready');  // Wait for the engine to be ready again.
      return;
    }

    if (uciStringSplitted[0] === 'readyok') {    // Engine is ready.
      // go movetime <time>: tells the engine to analyze the position for <time> milliseconds.
      this.stockfish?.postMessage(`go movetime ${this.thinkingTimeInMs}`); 
      return;
    }

    if (uciStringSplitted[0] === 'bestmove' && uciStringSplitted[1]) {
      if (uciStringSplitted[1] !== this.bestMove) {
        this.bestMove = uciStringSplitted[1];
        if (this.boardApi?.getTurnColor() === this.engineColor) {
          this.boardApi.move({
            from: this.bestMove.slice(0, 2) as SquareKey,
            to: this.bestMove.slice(2, 4) as SquareKey,
          });
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

  public sendPosition(position: string) {
    // ToDo: Startpos means the moves are from the initial position. That needs to change.
    // With SWAP, the initial FEN is different. The UCI command position CAN handle that.

    this.stockfish?.postMessage(`position startpos moves ${position}`); 
    this.stockfish?.postMessage(`go movetime ${this.thinkingTimeInMs}`);
  }
}