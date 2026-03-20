import { IGameRepository } from "../interfaces/IGameRepository.js";
import { Game } from "../types/game.js";

export class MemoryGameRepository implements IGameRepository {
    private games = new Map<string, Game>();
    
    async save(game: Game): Promise<void> {
        this.games.set(game.id, game);
    }
    
    async getById(id: string): Promise<Game | null> {
        return this.games.get(id) || null;
    }
    
    async delete(id: string): Promise<void> {
        this.games.delete(id);
    }
}
