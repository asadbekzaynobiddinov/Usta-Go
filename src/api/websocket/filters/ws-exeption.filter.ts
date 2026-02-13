import { Catch, ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

@Catch()
export class WsAllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const client = host.switchToWs().getClient();

    let error = exception;

    if (!(exception instanceof WsException)) {
      error = new WsException(
        exception?.response?.message || 'Validation error',
      );
    }

    client.emit('exeption', {
      success: false,
      message: error.getError(),
    });
  }
}
