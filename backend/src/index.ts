import express from "express";

import router from './routes/api.js'
import { MemoryChallengeRepository } from "./repositories/memory-challenge-repository.js";
import { ChallengeService } from "./challenge-service.js";
import { errorHandler } from "./middlewares/error-handler.js";

console.log('Hello, world!')
const port = 3000; // ToDo: configute it with .env file

const challengeRepository = new MemoryChallengeRepository();  // Soon: REDIS challenge repository based on env variable

// Could be cleaner: Depency injection instead of a Singleton
export const challengeService = new ChallengeService(challengeRepository);

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