import { NestFactory } from '@nestjs/core';
import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { config } from 'src/config';
import { AllExceptionsFilter } from 'src/infrastructure/lib/exception/all.exception.filter';

export default class Application {
  public static async main(): Promise<void> {
    const app = await NestFactory.create(AppModule);
    app.useGlobalFilters(new AllExceptionsFilter());
    app.enableCors({
      origin: '*',
    });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      }),
    );
    const api = 'api/v1';
    app.setGlobalPrefix(api);
    void app.listen(config.API_PORT);
  }
}
