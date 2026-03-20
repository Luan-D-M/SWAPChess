import { Game } from "../types/game.js";

export interface IGameRepository {
    save(game: Game): Promise<void>;
    getById(id: string): Promise<Game | null>;
    delete(id: string): Promise<void>;
}
