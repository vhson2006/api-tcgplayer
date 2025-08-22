import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Employee } from 'src/modules/employee/entities/employee.entity';
import { Repository } from 'typeorm';
import { I18nService } from 'src/middlewares/globals/i18n/i18n.service';
import { Permission } from 'src/modules/role/entities/permission.entity';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Employee) private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(Permission) private readonly permissionRepository: Repository<Permission>,
    private readonly i18nService: I18nService,
  ) {}

  async findAll(query: any) {
    try {
      const response = await this.permissionRepository.findAndCount({});
      return {
        data: response[0],
        total: response[1]
      }
    } catch (e) {
      throw new BadRequestException(this.i18nService.translate('ERRORS.BAD_REQUEST'));
    }
  }
}
