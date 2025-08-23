import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { rateLimit }  from 'express-rate-limit';
import helmet from 'helmet';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import { AppModule } from 'src/app.module';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { urlencoded, json } from 'express';
import { NestExpressApplication } from '@nestjs/platform-express';
import { CircuitBreakerInterceptor } from './middlewares/globals/circuit-breaker/circuit-breaker.interceptor';
import { HttpExceptionFilter } from './middlewares/globals/http-exception.filter';
import { TimeoutInterceptor } from './middlewares/globals/timeout.interceptor';
import { WrapResponseInterceptor } from './middlewares/globals/wrap-response.interceptor';

async function bootstrap() {
  initializeTransactionalContext();
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('trust proxy', 'loopback');
  const config = app.get<ConfigService>(ConfigService);
  console.log(atob(config.get('global.corsDomainRegex')))
  console.log(config.get('environment'))
 
  app.use(
    rateLimit({
      windowMs: config.get('global.slotTime'),
      max: config.get('global.numberRequestPerSlot'),
    }),
  );
  app.enableCors({
    // origin: config.get('environment') === 'production' ? 
    //   new RegExp(atob(config.get('global.corsDomainRegex'))) : 
    //   '*',
    origin: '*',
    // origin: [
    //   'http://admin.shanovina.com',
    //   'https://admin.shanovina.com',
    //   'http://shanovina.com',
    //   'https://shanovina.com',
    // ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });
  app.use(compression());
  app.use(
    helmet({
      contentSecurityPolicy: false,
    }),
  );
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));
  app.use(json({ limit: '2mb' }));
  app.use(urlencoded({ extended: true, limit: '2mb' }));
  // app.use(cookieParser());
  app.useGlobalFilters(new HttpExceptionFilter());
  // app.useGlobalFilters(new NotFoundExceptionFilter());
  app.useGlobalInterceptors(
    new WrapResponseInterceptor(),
    new TimeoutInterceptor(config.get('global.timeout')),
    new CircuitBreakerInterceptor(),
  );
  app.setGlobalPrefix(config.get('api.prefix'));
  if (config.get('environment') === 'development') {
    const options = new DocumentBuilder()
      .setTitle(config.get('api.title'))
      .setDescription(config.get('api.description'))
      .setVersion(config.get('api.version'))
      .build();
    
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup(config.get('api.documentUri'), app, document);
  }
  
  await app.listen(config.get('global.port'));

}
bootstrap();
