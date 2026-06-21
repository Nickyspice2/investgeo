import type { WebSocketMessage, WhaleTransaction } from "@/types";
import { generateWhaleTransaction } from "@/lib/mockData";

type MessageHandler<T> = (message: WebSocketMessage<T>) => void;
type ErrorHandler = (error: Event) => void;

export interface WebSocketSubscription {
  unsubscribe: () => void;
}

/**
 * Manages a WebSocket connection with automatic reconnection.
 * Falls back to a polling mock when no WS URL is configured.
 */
class WhaleWebSocketClient {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private mockInterval: ReturnType<typeof setInterval> | null = null;

  private transactionHandlers = new Set<MessageHandler<WhaleTransaction>>();
  private errorHandlers = new Set<ErrorHandler>();

  connect(wsUrl: string): void {
    if (this.socket?.readyState === WebSocket.OPEN) return;

    try {
      this.socket = new WebSocket(wsUrl);
      this.socket.onmessage = this.handleMessage;
      this.socket.onerror = this.handleError;
      this.socket.onclose = () => this.scheduleReconnect(wsUrl);
      this.reconnectAttempts = 0;
    } catch {
      this.scheduleReconnect(wsUrl);
    }
  }

  /** Starts a mock event stream emitting 1-3 transactions every 8 seconds. */
  connectMock(): void {
    if (this.mockInterval) return;

    this.mockInterval = setInterval(() => {
      const count = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < count; i++) {
        const tx = generateWhaleTransaction();
        this.transactionHandlers.forEach((handler) =>
          handler({ event: "transaction", channel: "whale_alert", data: tx, timestamp: Date.now() })
        );
      }
    }, 8_000);
  }

  subscribeToTransactions(handler: MessageHandler<WhaleTransaction>): WebSocketSubscription {
    this.transactionHandlers.add(handler);
    return { unsubscribe: () => this.transactionHandlers.delete(handler) };
  }

  onError(handler: ErrorHandler): () => void {
    this.errorHandlers.add(handler);
    return () => this.errorHandlers.delete(handler);
  }

  disconnect(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.mockInterval) clearInterval(this.mockInterval);
    this.socket?.close();
    this.socket = null;
    this.mockInterval = null;
  }

  private handleMessage = (event: MessageEvent): void => {
    try {
      const message = JSON.parse(event.data) as WebSocketMessage<WhaleTransaction>;
      if (message.channel === "whale_alert") {
        this.transactionHandlers.forEach((h) => h(message));
      }
    } catch {
      // Malformed messages are silently discarded
    }
  };

  private handleError = (error: Event): void => {
    this.errorHandlers.forEach((h) => h(error));
  };

  /** Exponential backoff capped at 30s. */
  private scheduleReconnect(wsUrl: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
    const delay = Math.min(1_000 * 2 ** this.reconnectAttempts, 30_000);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect(wsUrl);
    }, delay);
  }
}

export const whaleWsClient = new WhaleWebSocketClient();
