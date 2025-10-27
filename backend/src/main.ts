import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
   // Activer CORS pour autoriser Angular
  app.enableCors({
    origin: 'http://localhost:4200', // ton frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,             
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
