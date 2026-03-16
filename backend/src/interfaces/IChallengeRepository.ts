import { Challenge } from "../types/challenge.js";

export interface IChallengeRepository {
    save(challenge: Challenge): Promise<void>;
    getById(id: string): Promise<Challenge | null>;
    delete(id: string): Promise<void>;
}