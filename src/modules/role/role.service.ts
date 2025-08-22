import { BadRequestException, Inject, Injectable, LoggerService } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from 'src/modules/role/entities/role.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DEFAULT_SIZE, MAX_SIZE, DEFAULT_PAGE, INCORRECT, CORRECT } from 'src/assets/configs/app.constant';
import { DataSource, Like, Not, Repository } from 'typeorm';
import { I18nService } from 'src/middlewares/globals/i18n/i18n.service';
import { arrayDifference } from 'src/assets/utils/array';
import { Transactional } from 'typeorm-transactional';
import { RolePermission } from './entities/role-permission.entity';
import { Permission } from './entities/permission.entity';
import { Employee } from 'src/modules/employee/entities/employee.entity';
import { queryBuilderProcess } from 'src/assets/utils/query';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Injectable()
export class RoleService {
  constructor(
    private readonly i18nService: I18nService,
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
    @InjectRepository(RolePermission) private readonly rolePermissionRepository: Repository<RolePermission>,
    @InjectRepository(Employee) private readonly employeeRepository: Repository<Employee>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: LoggerService,
    @InjectDataSource() private dataSource: DataSource
  ) {}

  @Transactional()
  async create(createRoleDto: CreateRoleDto) {
    try {
      const { name, type, permissions } = createRoleDto
      const uniqueCheck = await this.roleRepository.findOne({
        where: {
          type: type
        }
      })
      if (uniqueCheck) {
        return { 
          status: INCORRECT, 
          message: this.i18nService.translate('ERRORS.DUPLICATE')
        };
      }
      
      const { identifiers } = await this.roleRepository.insert({
        typeName: JSON.stringify({ en: name, vi: name }),
        type
      });
      if (Array.isArray(identifiers) && identifiers.length > 0 ) {
        const fetchPermission = this.dataSource.createQueryBuilder()
          .select('permission.id')
          .from(Permission, 'permission')
          .where('"permission"."type" IN (:...type)', { 
            type: permissions.map((p: any) => p.value).map((r: any) => r.split('-')[0].trim()) 
          })
          .andWhere('"permission"."group" IN (:...group)', { 
            group: permissions.map((p: any) => p.value).map((r: any) => r.split('-')[1].trim()) 
          })
          
        await queryBuilderProcess(fetchPermission, async (data: any) => {
          await this.rolePermissionRepository.insert(data.map((d: any) => ({
            roleId: identifiers[0].id,
            permissionId: d.permission_id
          })));
        });
        return CORRECT
      }

      return { 
        status: INCORRECT, 
        message: this.i18nService.translate('ERRORS.UNSUCCESS')
      };
    } catch(e) {
      this.logger.error(`${JSON.stringify(e)}`);
      throw new BadRequestException(this.i18nService.translate('ERRORS.BAD_REQUEST'));
    }
  }

  async findAll(query: any) {
    try {
      const { search, page, size } = query;
      let queryObj: any = {
        relations: { permissions: true },
        skip: Math.min(size || DEFAULT_SIZE, MAX_SIZE) * ((page || DEFAULT_PAGE) - 1),
        take: Math.min(size || DEFAULT_SIZE, MAX_SIZE)
      }
      if (search) {
        queryObj = {
          ...queryObj, 
          where: [
            { type_name: Like(`%${search}%`) },
            { permissions: [
                { type_name: Like(`%${search}%`) },
                { group_name: Like(`%${search}%`) }
              ]
            },
          ],
        }
      }
      
      const response = await this.roleRepository.findAndCount(queryObj);
      return {
        data: response[0],
        total: response[1]
      }
    } catch (e) {
      this.logger.error(`${JSON.stringify(e)}`);
      throw new BadRequestException(this.i18nService.translate('ERRORS.BAD_REQUEST'));
    }
  }
  
  @Transactional()
  async update(role: Role, updateRoleDto: UpdateRoleDto) {
    try {
      const { lang, permissions, type, name } = updateRoleDto
      const uniqueCheck = await this.roleRepository.findOne({
        where: {
          type: type,
          id: Not(role.id)
        }
      })
      if (uniqueCheck) {
        return { 
          status: INCORRECT, 
          message: this.i18nService.translate('ERRORS.DUPLICATE')
        };
      }

      let newTypeName = JSON.parse(role.typeName);
      newTypeName[lang] = name;
      const lastPermissions = role.permissions.map((p: any) => `${p.type} - ${p.group}`);
      const newPermissions = permissions.map((p: any) => p.value);
      
      const removePermissions = arrayDifference(lastPermissions, newPermissions);
      if (Array.isArray(removePermissions) && removePermissions.length > 0) {
        const fetchRolePermission = this.dataSource.createQueryBuilder()
          .select('role_permission.id')
          .from(RolePermission, 'role_permission')
          .innerJoin(Permission, 'permission', 'permission.id = role_permission.permission_id')
          .where(`"role_permission"."role_id" = :roleId`, { roleId: role.id })
          .andWhere('"permission"."type" IN (:...type)', { type: removePermissions.map((r: any) => r.split('-')[0].trim()) })
          .andWhere('"permission"."group" IN (:...group)', { group: removePermissions.map((r: any) => r.split('-')[1].trim()) })
        await queryBuilderProcess(fetchRolePermission, async (data: any) => {
          await this.rolePermissionRepository.delete(data.map((d: any) => d.role_permission_id));
        });
      }

      const insertPermissions = arrayDifference(newPermissions, lastPermissions);
      if (Array.isArray(insertPermissions) && insertPermissions.length > 0) {
        const fetchPermission = this.dataSource.createQueryBuilder()
          .select('permission.id')
          .from(Permission, 'permission')
          .where('"permission"."type" IN (:...type)', { type: insertPermissions.map((r: any) => r.split('-')[0].trim()) })
          .andWhere('"permission"."group" IN (:...group)', { group: insertPermissions.map((r: any) => r.split('-')[1].trim()) })
        
        await queryBuilderProcess(fetchPermission, async (data: any) => {
          await this.rolePermissionRepository.insert(data.map((d: any) => ({
            roleId: role.id,
            permissionId: d.permission_id
          })));
        });
      }

      const response = await this.roleRepository.update(role.id, { type, typeName: newTypeName });
      if (response.affected > 0) {
        return CORRECT;
      }
      return { 
        status: INCORRECT, 
        message: this.i18nService.translate('ERRORS.UNSUCCESS')
      };
    } catch (e) {
      this.logger.error(`${JSON.stringify(e)}`);
      throw new BadRequestException(this.i18nService.translate('ERRORS.BAD_REQUEST'));
    }
  }
  
  @Transactional()
  async remove(role: Role) {
    try {
      const updateResponse = await this.roleRepository.update(role.id, { type: `${role.type}-${role.id}` });
      if (!updateResponse || updateResponse.affected <= 0) {
        return INCORRECT;
      };
      await this.rolePermissionRepository.softDelete({ roleId: role.id })
      await this.employeeRepository.update({ roleId: role.id }, { roleId: null });
      const response = await this.roleRepository.softDelete(role.id);
      if (response.affected > 0) {
        return CORRECT;
      }
      return { 
        status: INCORRECT, 
        message: this.i18nService.translate('ERRORS.UNSUCCESS')
      };
    } catch (e) {
      this.logger.error(`${JSON.stringify(e)}`);
      throw new BadRequestException(this.i18nService.translate('ERRORS.BAD_REQUEST'));
    }
  }

  
}
