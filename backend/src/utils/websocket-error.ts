export class WebSocketClientError extends Error {
    constructor(
        public readonly code: string,
        message: string
    ) {
        super(message);
        this.name = 'WebSocketClientError';
        
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, WebSocketClientError);
        }
    }
}