import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AbortExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AbortExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    if (exception instanceof Error && exception.message === 'Request aborted') {
      const res = host.switchToHttp().getResponse<Response>();
      if (!res.headersSent) {
        res.status(499).end();
      }
      return;
    }

    if (exception instanceof HttpException) {
      const res = host.switchToHttp().getResponse<Response>();
      const status = exception.getStatus();
      const message = exception.getResponse();
      if (!res.headersSent) {
        res.status(status).json(typeof message === 'string' ? { message } : message);
      }
      return;
    }

    this.logger.error(`Unhandled: ${exception instanceof Error ? exception.message : exception}`);
    const res = host.switchToHttp().getResponse<Response>();
    if (!res.headersSent) {
      res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
  }
}
