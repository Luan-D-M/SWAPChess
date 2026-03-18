import { WebSocketServer, WebSocket } from "ws";
import { ClientMessage } from "./types/client-messages-websocket.js";
import { TraditionalChessMove } from "./types/game.js";

type HandlerMap = {
    [K in ClientMessage['type']]: (
        ws: WebSocket, 
        payload: Extract<ClientMessage, { type: K }>['payload']
    ) => void | Promise<void>;
};

class WebSocketHandler {
    private wss?: WebSocketServer;

    private rooms = new Map<string, Set<WebSocket>>();

    private handlers: HandlerMap = {
        'MONITOR_CHALLENGE':    (ws, payload) => this.handleMonitor(ws, payload),
        'ACCEPT_CHALLENGE':     (ws, payload) => this.handleAccept(ws, payload),
        'MAKE_MOVE':            (ws, payload) => this.handleMove(ws, payload),
        'DRAW_OFFER':           (ws, payload) => this.handleDrawOffer(ws, payload),
        'ACCEPT_DRAW_OFFER':    (ws, payload) => this.handleDrawAccept(ws, payload),
        'RESIGN':               (ws, payload) => this.handleResign(ws, payload),
        'REMATCH_OFFER':        (ws, payload) => this.handleRematchOffer(ws, payload),
        'ACCEPT_REMATCH_OFFER': (ws, payload) => this.handleRematchAccept(ws, payload),
        'REJOIN_GAME':          (ws, payload) => this.handleRejoin(ws, payload),
    };


    constructor() {}

    public startServer(port: number) {
        this.wss = new WebSocketServer({ port });

        this.wss.on('connection', (ws: WebSocket) => {
            console.log('New client connected');

            ws.on('message', (raw) => this.handleMessage(ws, raw.toString()));
            ws.on('close', () => this.handleDisconnect(ws));
        });

        console.log(`WebSocket server started on port ${port}`);
    }

    private handleMessage(ws: WebSocket, data: string) {
        try {
            const message = JSON.parse(data) as ClientMessage;
            const handler = this.handlers[message.type];
            
            if (handler) {
                handler(ws, message.payload as any); 
            } else {
                console.warn(`No handler found for message type: ${message.type}`);
            }
        } catch (error) {
            ws.send(JSON.stringify(
            {
                type: 'ERROR', 
                payload: { code: 'INVALID_FORMAT', message: 'Message must be valid JSON' }  // ToDo: improve error message
            }));
        }
    }
    private handleDisconnect(ws: WebSocket) {
        // ToDo: How to reconnect?
    }

    private handleMonitor(ws: WebSocket, payload: { challengeId: string; playerId: string }) {}
    
    private handleAccept(ws: WebSocket, payload: { challengeId: string; playerId: string }) {}
    
    private handleMove(ws: WebSocket, payload: { gameId: string; playerId: string; move: TraditionalChessMove | 'swap' }) {}
    
    private handleDrawOffer(ws: WebSocket, payload: { gameId: string; playerId: string }) {}
    
    private handleDrawAccept(ws: WebSocket, payload: { gameId: string; playerId: string }) {}
    
    private handleResign(ws: WebSocket, payload: { gameId: string; playerId: string }) {}
    
    private handleRematchOffer(ws: WebSocket, payload: { gameId: string; playerId: string }) {}
    
    private handleRematchAccept(ws: WebSocket, payload: { gameId: string; playerId: string }) {}
    
    private handleRejoin(ws: WebSocket, payload: { gameId: string; playerId: string }) {}



}