import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MulterModule } from '@nestjs/platform-express';
import { UploadController } from './upload.controller';
import { JwtModule } from '@nestjs/jwt';
import { config } from 'src/config';

@Module({
  imports: [
    JwtModule.register({
      secret: config.ACCESS_TOKEN_KEY,
    }),
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
