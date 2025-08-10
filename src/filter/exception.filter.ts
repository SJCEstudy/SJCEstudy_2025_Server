import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { Request, Response } from "express";
import { Socket } from "socket.io";

@Catch()
export class MyGlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(MyGlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const type = host.getType<'http' | 'ws'>();
    const message = (exception as any)?.message ?? exception;

    if (type === 'http') {
      this.handleHttpException(exception, host, message);
    } else if (type === 'ws') {
      this.handleWsException(exception, host, message);
    } 
  }

  private handleHttpException(exception: unknown, host: ArgumentsHost, message: any) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
    }

    this.logger.error(
      `[HTTP] ${req?.method} ${req?.url} - ${message}`,
      (exception as any)?.stack,
    );

    res.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: req.url,
      message,
    });
  }

  private handleWsException(exception: unknown, host: ArgumentsHost, message: any) {
    const wsCtx = host.switchToWs();
    const client = wsCtx.getClient<Socket>();
    const data = wsCtx.getData();

    this.logger.error(
      `[WS] Client: ${client?.id} - Data: ${JSON.stringify(data)} - ${message}`,
      (exception as any)?.stack,
    );

    client.emit('error', {
      status: 'error',
      message,
      timestamp: new Date().toISOString(),
    });
  }

}