import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { PostController } from './controllers/post.controller';
import { PostService } from './services/post.service';
import { ModerationService } from './services/moderation.service';
import { PostRepository } from './repositories/post.repository';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [PostController],
  providers: [PostService, ModerationService, PostRepository],
  exports: [PostService],
})
export class PostModule {}
