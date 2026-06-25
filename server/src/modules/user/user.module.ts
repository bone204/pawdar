import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { UserController } from './controllers/user.controller';
import { FriendController } from './controllers/friend.controller';
import { UserService } from './services/user.service';
import { FriendService } from './services/friend.service';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [PrismaModule, AuthModule, NotificationModule],
  controllers: [UserController, FriendController],
  providers: [UserService, FriendService],
  exports: [UserService, FriendService],
})
export class UserModule {}
