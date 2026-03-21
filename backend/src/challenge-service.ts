import { randomUUID } from 'node:crypto';

import { DefinedHostColor, HostColor } from './types/hostColor.js';
import { TimeControl } from './types/timeControl.js';
import { Challenge } from "./types/challenge.js";
import { IChallengeRepository } from './interfaces/IChallengeRepository.js';
import { getRandomInteger } from './utils/randomInteger.js';

export class ChallengeService {
    constructor(private challengeRepository: IChallengeRepository) {}

    async createChallenge(hostColor: HostColor, timeControl: TimeControl): Promise<string> {
        const id = randomUUID();
        
        let colorWasRandom = false 
        if (hostColor === 'random') {
            colorWasRandom = true
            const sortedWhiteColor = (getRandomInteger(1,2) === 1);
            hostColor = sortedWhiteColor ? 'white' : 'black'
        }

        const challenge: Challenge = {
            id,
            timeControl,
            hostColor: hostColor as DefinedHostColor,
            createdAt: Date.now(),
            colorWasRandom
        };

        await this.challengeRepository.save(challenge);
        
        return id;
    }

    async getChallengeById(id: string): Promise<Challenge | null> {
        return await this.challengeRepository.getById(id);
    }
}