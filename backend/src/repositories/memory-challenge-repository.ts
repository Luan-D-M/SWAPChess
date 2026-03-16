import { IChallengeRepository } from "../interfaces/IChallengeRepository.js";
import { Challenge } from "../types/challenge.js";

export class MemoryChallengeRepository implements IChallengeRepository {
    private challenges = new Map<string, Challenge>();

    async save(challenge: Challenge): Promise<void> {
        this.challenges.set(challenge.id, challenge);
    }

    async getById(id: string): Promise<Challenge | null> {
        return this.challenges.get(id) || null;
    }

    async delete(id: string): Promise<void> {
        this.challenges.delete(id);
    }
}