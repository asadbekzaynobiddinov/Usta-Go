import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MulterModule } from '@nestjs/platform-express';
import { UploadController } from './upload.controller';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads',
    }),
    ServeStaticModule.forRoot({
      rootPath: './uploads',
      serveRoot: '/static',
    }),
  ],
  controllers: [UploadController],
})
export class UploadModule {}
