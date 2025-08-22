import { BadRequestException, Inject, Injectable, LoggerService } from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Employee } from 'src/modules/employee/entities/employee.entity';
import { I18nService } from 'src/middlewares/globals/i18n/i18n.service';
import { In, Like, Not, Repository } from 'typeorm';
import { CORRECT, DEFAULT_PAGE, DEFAULT_SIZE, INCORRECT, MAX_SIZE } from 'src/assets/configs/app.constant';
import { EmployeeStatus } from './entities/employee-status.entity';
import { EMPLOYEE_STATUS, MEDIA_STATUS } from 'src/assets/configs/app.common';
import { Role } from 'src/modules/role/entities/role.entity';
import { HashingService } from 'src/middlewares/iam/hashing/hashing.service';
import { Avatar } from './entities/avatar.entity';
import { MediaStatus } from 'src/modules/media/entities/media-status.entity';
import { Transactional } from 'typeorm-transactional';
import { sliceIntoChunks, uniqueArray } from 'src/assets/utils/array';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Injectable()
export class EmployeeService {
  constructor(
    private readonly i18nService: I18nService,
    @InjectRepository(Employee) private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(EmployeeStatus) private readonly employeeStatusRepository: Repository<EmployeeStatus>,
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
    @InjectRepository(Avatar) private readonly avatarRepository: Repository<Avatar>,
    @InjectRepository(MediaStatus) private readonly mediaStatusRepository: Repository<MediaStatus>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: LoggerService,
    private readonly hashingService: HashingService,
  ) {}

  @Transactional()
  async create(createEmployeeDto: CreateEmployeeDto) {
    try {
      const { role, status, avatar: avatarId, username, email, phone, ...others } = createEmployeeDto
      let query = []
      if (username) {
        query = [
          ...query,
          { username: username }
        ]
      }
      if (email) {
        query = [
          ...query,
          { email: email }
        ]
      }
      if (phone) {
        query = [
          ...query,
          { phone: phone }
        ]
      }
      if (Array.isArray(query) && query.length > 0) {
        const uniqueCheck = await this.employeeRepository.findOne({
          where: query
        })
        if (uniqueCheck) {
          return { 
            status: INCORRECT, 
            message: this.i18nService.translate('ERRORS.DUPLICATE')
          };
        }
      }
      const { id: statusId } = await this.employeeStatusRepository.findOne({
        where: {
          type: status,
          group: EMPLOYEE_STATUS.GROUP
        }
      })

      const { id: roleId } = await this.roleRepository.findOne({
        where: {
          type: role,
        }
      })

      if (avatarId) {
        const { id: mediaStatusId } = await this.mediaStatusRepository.findOne({
          where: {
            type: MEDIA_STATUS.ASSIGN,
            group: MEDIA_STATUS.GROUP
          }
        })
        await this.avatarRepository.update(avatarId, { statusId: mediaStatusId });
      }
      
      const { identifiers } = await this.employeeRepository.insert({
        ...others,
        username, 
        email, 
        phone,
        password: await this.hashingService.hash('default'),
        statusId,
        roleId,
        avatarId
      })
      if (Array.isArray(identifiers) && identifiers.length > 0) {
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
      const { role, status, search, page, size } = query;
      let queryObj: any = {
        skip: Math.min(size || DEFAULT_SIZE, MAX_SIZE) * ((page || DEFAULT_PAGE) - 1),
        take: Math.min(size || DEFAULT_SIZE, MAX_SIZE)
      }

      if (role) {
        queryObj = {
          ...queryObj,
          relations: { ...queryObj.relations, role: true },
          where: { ...queryObj.where, role: { type: In(role.split(",")) }},
        }
      }
      if (status) {
        queryObj = {
          ...queryObj,
          relations: { ...queryObj.relations, status: true },
          where: { ...queryObj.where, status: { type: status }},
        }
      }
      if (search) {
        queryObj = {
          ...queryObj, 
          where: [
            { ...queryObj.where, name: Like(`%${search}%`) },
            { ...queryObj.where, phone: Like(`%${search}%`) },
            { ...queryObj.where, address: Like(`%${search}%`) },
            { ...queryObj.where, email: Like(`%${search}%`) },
          ],
        }
      }
      const response = await this.employeeRepository.findAndCount(queryObj);
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
  async update(employee: Employee, updateEmployeeDto: UpdateEmployeeDto) {
    try {
      const { role, status, avatar, username, email, phone, ...others } = updateEmployeeDto
      let query = []
      if (username) {
        query = [
          ...query,
          { username: username, id: Not(employee.id) }
        ]
      }
      if (email) {
        query = [
          ...query,
          { email: email, id: Not(employee.id) }
        ]
      }
      if (phone) {
        query = [
          ...query,
          { phone: phone, id: Not(employee.id) }
        ]
      }
      if (Array.isArray(query) && query.length > 0) {
        const uniqueCheck = await this.employeeRepository.findOne({
          where: query
        })
        if (uniqueCheck) {
          return { 
            status: INCORRECT, 
            message: this.i18nService.translate('ERRORS.DUPLICATE')
          };
        }
      }
      const { id: statusId } = await this.employeeStatusRepository.findOne({
        where: {
          type: status,
          group: EMPLOYEE_STATUS.GROUP
        }
      })
      const { id: roleId } = await this.roleRepository.findOne({
        where: {
          type: role,
        }
      })
      if (avatar) {
        await this.avatarRepository.softDelete(employee.avatarId);
        const { id: mediaStatusId } = await this.mediaStatusRepository.findOne({
          where: {
            type: MEDIA_STATUS.ASSIGN,
            group: MEDIA_STATUS.GROUP
          }
        })
        await this.avatarRepository.update(avatar, { statusId: mediaStatusId });
      }
      const response = await this.employeeRepository.update(
        employee.id, 
        { ...others, username, email, phone, statusId, roleId, avatarId: avatar }
      );
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
  async remove(employee: Employee) {
    try {
      const updateResponse = await this.employeeRepository.update(employee.id, { 
        username: `${employee.username}-${employee.id}`, 
        email: `${employee.email}-${employee.id}`, 
        phone: `${employee.phone}-${employee.id}` 
      });
      
      if (!updateResponse || updateResponse.affected <= 0) {
        return INCORRECT;
      }
      await this.avatarRepository.softDelete(employee.avatarId);
      const response = await this.employeeRepository.softDelete(employee.id);
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

  async massChangeStatus(selected: any, status: any) {
    try {
      const { id: statusId } = await this.employeeStatusRepository.findOne({
        where: {
          type: status,
          group: EMPLOYEE_STATUS.GROUP
        }
      })
      const response = await this.employeeRepository.update(
        selected.map((s: any) => ({ id: s })), 
        { statusId }
      );
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
  async importEmployees(data: any) {
    try {
      const statuses = await this.employeeStatusRepository.find({
        where: {
          type: In(uniqueArray(data.map((c: any) => c.status))),
          group: EMPLOYEE_STATUS.GROUP
        }
      })
  
      const roles = await this.roleRepository.find({
        where: {
          type: In(uniqueArray(data.map((c: any) => c.role))),
        }
      })
  
      const excuteData = sliceIntoChunks(data, 100)
      const response = excuteData.reduce(async (pre: any, cur: any) => {
        if (Array.isArray(pre) && pre.length > 0) {
          return pre
        }
        
        const identifiers = cur.map((c: any) => c.identified);
        if (identifiers.length !== uniqueArray(identifiers).length) {
  
        }
        const emails = cur.map((c: any) => c.email);
        if (emails.length !== uniqueArray(emails).length) {
  
        }
        const phones = cur.map((c: any) => c.phone);
        if (phones.length !== uniqueArray(phones).length) {
  
        }
  
        let query = [];
        if (identifiers) {
          query = [
            ...query,
            { identified: In(identifiers) }
          ]
        }
  
        if (emails) {
          query = [
            ...query,
            { email: In(emails) }
          ]
        }
  
        if (phones) {
          query = [
            ...query,
            { phone: In(phones) }
          ]
        }
  
        const uniqueCheck = await this.employeeRepository.find({ where: query })
        if (Array.isArray(uniqueCheck) && uniqueCheck.length > 0) {
          return uniqueCheck.map((n: any) => n.name)
        }

        const results = await this.employeeRepository.insert(
          await Promise.all(
            cur.map(async (employee: any) => {
              const { role, status } = employee
              
              return {
                ...employee,
                dob: null,
                password: await this.hashingService.hash('default'),
                statusId: statuses.find((s: any) => s.type === status)?.id,
                roleId: roles.find((s: any) => s.type === role)?.id,
              }
            })
          )
        )
        if (Array.isArray(results.identifiers) && results.identifiers.length > 0) {
          return []
        } else {
          return [CORRECT]
        }
      }, [])

      if (Array.isArray(response) && response.length > 0) {
        throw new BadRequestException(this.i18nService.translate('ERRORS.UNSUCCESS'));
      }

      return response
    } catch(e) {
      this.logger.error(`${JSON.stringify(e)}`);
      return [CORRECT]
    }
  }
}
