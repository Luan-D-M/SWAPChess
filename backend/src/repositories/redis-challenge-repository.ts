import { IChallengeRepository } from "../interfaces/IChallengeRepository.js";
import { Challenge } from "../types/challenge.js";

// ToDo: 
export class RedisChallengeRepository implements IChallengeRepository {
    async save(challenge: Challenge): Promise<void> {
        
    }

    async getById(id: string): Promise<Challenge | null> {
        return null
    }

    async delete(id: string): Promise<void> {
        
    }
}