import { WebSocketServer, WebSocket } from "ws";

class WebSocketHandler {
    private wss?: WebSocketServer;

    private rooms = new Map<string, Set<WebSocket>>();

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

    }

    private handleDisconnect(ws: WebSocket) {
        // ToDo: How to reconnect?
    }



}