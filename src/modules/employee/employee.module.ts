import { Module } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from 'src/modules/employee/entities/employee.entity';
import { I18nService } from 'src/middlewares/globals/i18n/i18n.service';
import { EmployeeStatus } from './entities/employee-status.entity';
import { AuthorizationService } from 'src/middlewares/iam/authorization/authorization.service';
import { Avatar } from './entities/avatar.entity';
import { Role } from 'src/modules/role/entities/role.entity';
import { HashingService } from 'src/middlewares/iam/hashing/hashing.service';
import { BcryptService } from 'src/middlewares/iam/hashing/bcrypt.service';
import { MediaStatus } from 'src/modules/media/entities/media-status.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee, Role, EmployeeStatus, Avatar, MediaStatus])
  ],
  controllers: [EmployeeController],
  providers: [
    {
      provide: HashingService,
      useClass: BcryptService,
    },
    EmployeeService, 
    I18nService, 
    AuthorizationService
  ],
})
export class EmployeeModule {}
