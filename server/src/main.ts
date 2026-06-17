import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
      ];

      const appUrl = process.env.APP_URL;
      if (appUrl) {
        let cleanAppUrl = appUrl.trim();
        if (cleanAppUrl.endsWith('/')) {
          cleanAppUrl = cleanAppUrl.slice(0, -1);
        }
        const formattedAppUrl = cleanAppUrl.startsWith('http://') || cleanAppUrl.startsWith('https://')
          ? cleanAppUrl
          : `https://${cleanAppUrl}`;
        
        allowedOrigins.push(formattedAppUrl);
        allowedOrigins.push(cleanAppUrl);
      }

      const isLocalhost = origin.startsWith('http://localhost:') || 
                          origin.startsWith('https://localhost:') || 
                          origin.startsWith('http://127.0.0.1:') ||
                          origin.startsWith('https://127.0.0.1:');

      if (allowedOrigins.indexOf(origin) !== -1 || isLocalhost) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  // Global Exception Filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('Pawdar API')
    .setDescription('The Pawdar API Description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Pawdar Backend is running at: http://localhost:${port}`);
  console.log(`📖 Swagger API documentation is available at: http://localhost:${port}/api/docs`);
}
bootstrap();
