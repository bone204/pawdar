import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
  
  // Lưu trữ các timeout đánh dấu offline để chống hiện tượng F5 nhấp nháy
  private disconnectTimeouts = new Map<string, NodeJS.Timeout>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

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
      const roomName = `user_${userId}`;
      client.join(roomName);

      // Đếm số lượng socket trong room của user này
      const roomSize = this.server.sockets.adapter.rooms.get(roomName)?.size || 0;

      // Nếu là kết nối đầu tiên (vừa online)
      if (roomSize === 1) {
        // Hủy bỏ lệnh đánh dấu offline (nếu do vừa F5)
        if (this.disconnectTimeouts.has(userId)) {
          clearTimeout(this.disconnectTimeouts.get(userId));
          this.disconnectTimeouts.delete(userId);
        } else {
          // Báo Online lên DB và Friends
          const now = new Date();
          await this.prisma.user.update({
            where: { id: userId },
            data: { isOnline: true, lastActiveAt: now },
          });
          this.broadcastUserStatus(userId, true, now);
        }
      }

      this.logger.log(`Client connected: ${client.id} (Joined Room: ${roomName}, Total sockets: ${roomSize})`);
    } catch (err) {
      this.logger.error(`Authentication error on connection: ${err.message}`);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      const roomName = `user_${userId}`;
      
      // Tại thời điểm disconnect, client đã tự rời room. 
      // Tuy nhiên đôi khi adapter chưa cập nhật kịp, nên ta check client.rooms (nhưng trong disconnect nó empty)
      // fetchSockets() là an toàn nhất để biết room còn ai không
      const socketsInRoom = await this.server.in(roomName).fetchSockets();
      
      if (socketsInRoom.length === 0) {
        // ANTI-FLICKERING: Không đánh dấu offline ngay, đợi 5 giây
        const timeout = setTimeout(async () => {
          try {
            this.disconnectTimeouts.delete(userId);
            const now = new Date();
            await this.prisma.user.update({
              where: { id: userId },
              data: { isOnline: false, lastActiveAt: now },
            });
            this.broadcastUserStatus(userId, false, now);
          } catch (e) {
            this.logger.error(`Error updating offline status: ${e.message}`);
          }
        }, 5000);
        
        this.disconnectTimeouts.set(userId, timeout);
      }

      this.logger.log(`Client disconnected: ${client.id} (Left Room: ${roomName})`);
    }
  }

  sendToUser(userId: string, event: string, data: any) {
    const roomName = `user_${userId}`;
    this.server.to(roomName).emit(event, data);
    return true;
  }

  private async broadcastUserStatus(userId: string, isOnline: boolean, lastActiveAt: Date) {
    try {
      // Lấy danh sách bạn bè (ACCEPTED)
      const friendships = await this.prisma.friendship.findMany({
        where: {
          status: 'ACCEPTED',
          OR: [
            { senderId: userId },
            { receiverId: userId },
          ],
        },
      });

      const friendIds = friendships.map(f => f.senderId === userId ? f.receiverId : f.senderId);

      // Gửi event tới tất cả bạn bè
      friendIds.forEach(friendId => {
        this.sendToUser(friendId, 'user_status_changed', { userId, isOnline, lastActiveAt });
      });
    } catch (e) {
      this.logger.error(`Error broadcasting user status: ${e.message}`);
    }
  }
}
