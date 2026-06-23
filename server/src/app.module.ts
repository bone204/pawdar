import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { BreedModule } from './modules/breed/breed.module';
import { PetModule } from './modules/pet/pet.module';
import { UploadModule } from './modules/upload/upload.module';
import { PostModule } from './modules/post/post.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    BreedModule,
    PetModule,
    UploadModule,
    PostModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}


