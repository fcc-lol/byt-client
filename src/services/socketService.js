import { io } from "socket.io-client";

const socketURL =
  process.env.RAILWAY_ENVIRONMENT_NAME === "production"
    ? "wss://byt-server-production.up.railway.app"
    : "ws://localhost:3000";

class SocketService {
  static instance = null;
  socket = null;
  notificationCallbacks = new Set();
  reconnectAttempts = 0;
  maxReconnectAttempts = 5;

  static getInstance() {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  connect(serverUrl = socketURL) {
    if (this.socket?.connected) {
      console.warn("Socket is already connected");
      return;
    }

    this.socket = io(serverUrl, {
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000
    });

    this.setupEventListeners();
  }

  setupEventListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("Connected to WebSocket server");
      this.reconnectAttempts = 0;
    });

    this.socket.on("disconnect", (reason) => {
      console.log(`Disconnected from WebSocket server: ${reason}`);
    });

    this.socket.on("notification", (notification) => {
      this.notificationCallbacks.forEach((callback) => callback(notification));
    });

    this.socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error("Max reconnection attempts reached");
        this.disconnect();
      }
    });
  }

  onNotification(callback) {
    this.notificationCallbacks.add(callback);

    // Return cleanup function
    return () => {
      this.notificationCallbacks.delete(callback);
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected() {
    return this.socket?.connected ?? false;
  }

  // Method to manually send a test notification (useful for development)
  sendTestNotification() {
    if (!this.socket?.connected) {
      console.warn("Socket is not connected");
      return;
    }

    this.socket.emit("test-notification");
  }
}

export const socketService = SocketService.getInstance();
