declare module 'ws' {
  import type { IncomingMessage } from 'node:http';
  import type { Socket } from 'node:net';

  export type RawData = string | ArrayBuffer | Buffer | Buffer[];

  export class WebSocket {
    static OPEN: number;
    readyState: number;
    send(data: RawData): void;
    close(code?: number, data?: string): void;
    on(event: 'message', listener: (data: RawData) => void): this;
    on(event: 'close' | 'error' | 'open', listener: () => void): this;
  }

  export class WebSocketServer {
    constructor(options?: { noServer?: boolean });
    handleUpgrade(
      req: IncomingMessage,
      socket: Socket,
      head: Buffer,
      callback: (ws: WebSocket, request: IncomingMessage) => void
    ): void;
    on(event: 'connection', listener: (ws: WebSocket, request: IncomingMessage) => void): this;
    emit(event: 'connection', ws: WebSocket, request: IncomingMessage): boolean;
  }
}
