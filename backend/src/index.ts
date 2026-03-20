import express from "express";

import router from './routes/api.js'
import { MemoryChallengeRepository } from "./repositories/memory-challenge-repository.js";
import { ChallengeService } from "./challenge-service.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { WebSocketHandler } from "./websocket-handler.js";
import { MemoryGameRepository } from "./repositories/memory-game-repository.js";
import { ChessHandler } from "./chess-handler.js";

console.log('Hello, world!')
const port = 3000; // ToDo: configute it with .env file


// Soon: REDIS repositories based on env variable
const challengeRepository = new MemoryChallengeRepository();  
const gameRepository = new MemoryGameRepository()

// Could be cleaner: Depency injection instead of a Singleton
export const challengeService = new ChallengeService(challengeRepository);

const chessHandler = new ChessHandler(gameRepository)

export const websocketHandler = new WebSocketHandler(
    challengeRepository,
    gameRepository,
    chessHandler
  )

const app = express();
app.use(express.json());
app.use('/', router); 
app.use(errorHandler);

const httpServer = app.listen(
  port,
  () => {
    console.log(`Server running on port ${port}`);
  }
);