import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import jwtConfig from './config/jwt.config';
import { HashingService } from './hashing/hashing.service';
import { BcryptService } from './hashing/bcrypt.service';
import { AuthenticationService } from './authentication/authentication.service';
import { AuthenticationController } from './authentication/authentication.controller';
import { AccessTokenGuard } from './authentication/guards/access-token/access-token.guard';
import { AuthenticationGuard } from './authentication/guards/authentication/authentication.guard';
import { RefreshTokenIdsStorage } from './authentication/refresh-token-ids.storage/refresh-token-ids.storage';
import { PermissionsGuard } from './authorization/guards/permission.guard';
import { Employee } from 'src/modules/employee/entities/employee.entity';
import { I18nService } from 'src/middlewares/globals/i18n/i18n.service';
import { AuthorizationService } from './authorization/authorization.service';
import { Role } from 'src/modules/role/entities/role.entity';
import { Customer } from 'src/modules/customer/entities/customer.entity';
import { CustomerAuthenticationService } from './authentication/customer-authentication.service';
import { CustomerAuthenticationController } from './authentication/customer-authentication.controller';
import { ValidateToken } from './entities/validate-token.entity';
import { BullModule } from '@nestjs/bull';
import { AuthenticationProcessor } from './authentication/authentication.processor';
import { MailerModule } from '@nestjs-modules/mailer';
import { QUEUE } from 'src/assets/configs/app.constant';
import { CustomerType } from 'src/modules/customer/entities/customer-type.entity';
import { ValidateTokenType } from './entities/validate-token-type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee, Role, Customer, CustomerType, ValidateToken, ValidateTokenType]),
    BullModule.registerQueue({
      name: QUEUE.SEND_EMAIL,
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        transport: {
          service: configService.get('email.type'),
          auth: {
            user: configService.get('email.sender'),
            pass: configService.get('email.password')
          }
        }
      }),
      inject: [ConfigService],
    }),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig)
  ],
  providers: [ 
    {
      provide: HashingService,
      useClass: BcryptService,
    },
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
    AuthenticationProcessor,
    RefreshTokenIdsStorage,
    AccessTokenGuard,
    AuthenticationService,
    CustomerAuthenticationService,
    AuthorizationService,
    I18nService,
  ],
  controllers: [AuthenticationController, CustomerAuthenticationController],
})
export class IamModule {}
