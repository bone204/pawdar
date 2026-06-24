import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Injectable, Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Injectable()
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(SocketGateway.name);
  // Map userId to socket ids
  private userSockets = new Map<string, string[]>();

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const authHeader = client.handshake.headers.authorization || client.handshake.auth?.token;
      
      if (!authHeader) {
        client.disconnect();
        return;
      }

      const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'pawdar_access_token_secret_key_2026_safe_and_long_enough',
      });

      const userId = payload.sub;
      if (!userId) {
        client.disconnect();
        return;
      }

      client.data.userId = userId;

      const existingSockets = this.userSockets.get(userId) || [];
      existingSockets.push(client.id);
      this.userSockets.set(userId, existingSockets);

      this.logger.log(`Client connected: ${client.id} (User: ${userId})`);
    } catch (err) {
      this.logger.error(`Authentication error on connection: ${err.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      const existingSockets = this.userSockets.get(userId) || [];
      const updatedSockets = existingSockets.filter((id) => id !== client.id);
      
      if (updatedSockets.length === 0) {
        this.userSockets.delete(userId);
      } else {
        this.userSockets.set(userId, updatedSockets);
      }
      this.logger.log(`Client disconnected: ${client.id} (User: ${userId})`);
    }
  }

  sendToUser(userId: string, event: string, data: any) {
    const socketIds = this.userSockets.get(userId);
    if (socketIds && socketIds.length > 0) {
      socketIds.forEach((socketId) => {
        this.server.to(socketId).emit(event, data);
      });
      return true;
    }
    return false;
  }
}
