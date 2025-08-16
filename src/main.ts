import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MyGlobalExceptionFilter } from './filter/exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new MyGlobalExceptionFilter());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
