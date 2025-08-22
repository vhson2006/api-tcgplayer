import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Headers, Put, Res, StreamableFile } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeQueryDto } from './dto/query-employee.dto';
import { CORRECT, INCORRECT } from 'src/assets/configs/app.constant';
import { CREATE, DELETE, UPDATE, VIEW } from 'src/assets/configs/app.permission';
import { Auth } from 'src/middlewares/iam/authentication/decorators/auth.decorator';
import { AuthType } from 'src/middlewares/iam/authentication/enums/auth-type.enum';
import { Permissions } from 'src/middlewares/iam/authorization/decorators/permission.decoration';
import { Employee } from './entities/employee.entity';
import { EntityExistsPipe } from 'src/middlewares/globals/entity-exists.pipe';
import { ActiveUser } from 'src/middlewares/iam/authentication/decorators/active-user.decorator';
import { createObjectCsvWriter } from 'csv-writer';
import { createReadStream } from 'fs';
import { join } from 'path';
import { I18nService } from 'src/middlewares/globals/i18n/i18n.service';
import { ConfigService } from '@nestjs/config';

@Auth(AuthType.Bearer)
@Controller('employee')
export class EmployeeController {
  constructor(
    private readonly i18nService: I18nService,
    private readonly configService: ConfigService,
    private readonly employeeService: EmployeeService
  ) {}

  @Permissions(`${CREATE.GROUP}.${CREATE.EMPLOYEE}`)
  @Post()
  async create(@Body() createEmployeeDto: CreateEmployeeDto) {
    const response = await this.employeeService.create(createEmployeeDto);
    if (CORRECT === response) {
      return { status: CORRECT }
    }
    return response
  }

  @Permissions(`${CREATE.GROUP}.${CREATE.EMPLOYEE}`)
  @Post('import')
  async import(@Body() data: any[]) {
    const restructureData = data.reduce((pre: any, cur: any, curIndex :any) => {
      if (curIndex === 0) {
        return pre
      }

      return [ 
        ...pre, 
        data[0].reduce((pd: any, cd: any, idx: any) => {
          pd[cd] =  cur[idx]
          return pd
        }, {}) 
      ]
    }, [])
    const convertedData = restructureData.map((d: any) => {
      const { 
        Name: name, Identified: identified, Username: username,
        Email: email, Phone: phone, Address: address, 
        'Date of Birth': dob, Status: status, Role: role
      } = d;
      return {
        name, identified, username, email, phone, address, dob, status, role
      }
    })
    const response = await this.employeeService.importEmployees(convertedData)
    return { 
      status: Array.isArray(response) && response.length > 0 ? INCORRECT : CORRECT,
      data: response  
    }
  }
  
  @Permissions(`${VIEW.GROUP}.${VIEW.EMPLOYEE}`)
  @Get('download')
  async download(@Headers('accept-language') language, @Query() query: EmployeeQueryDto, @Res() res) {
    const pathToFile = `${this.configService.get('global.temp')}/employee.csv`;
    const employees = await this.employeeService.findAll(query);
    const csvWriter = createObjectCsvWriter({
      path: pathToFile,
      header: [
        {id: 'name', title: this.i18nService.translate('DOWNLOAD_EMPLOYEE.NAME')},
        {id: 'identified', title: this.i18nService.translate('DOWNLOAD_EMPLOYEE.IDENTIFIED')},
        {id: 'username', title: this.i18nService.translate('DOWNLOAD_EMPLOYEE.USERNAME')},
        {id: 'email', title: this.i18nService.translate('DOWNLOAD_EMPLOYEE.EMAIL')},
        {id: 'phone', title: this.i18nService.translate('DOWNLOAD_EMPLOYEE.PHONE')},
        {id: 'address', title: this.i18nService.translate('DOWNLOAD_EMPLOYEE.ADDRESS')},
        {id: 'dob', title: this.i18nService.translate('DOWNLOAD_EMPLOYEE.DOB')},
        {id: 'status', title: this.i18nService.translate('DOWNLOAD_EMPLOYEE.STATUS')},
        {id: 'role', title: this.i18nService.translate('DOWNLOAD_EMPLOYEE.ROLE')},
      ]
    })

    await csvWriter.writeRecords(employees.data.map((e: any) => ({
      name: e.name,
      identified: e.identified,
      username: e.username,
      email: e.email,
      phone: e.phone,
      address: e.address,
      dob: e.dob,
      status: e.status ? JSON.parse(e.status.type_name)[language] : null,
      role: e.role ? JSON.parse(e.role.type_name)[language] : null
    })));

    res.setHeader('Content-disposition', 'attachment; filename=' + `employee.csv`);
    const sourceFile = createReadStream(join(process.cwd(), pathToFile));
    sourceFile.pipe(res);
    return new StreamableFile(sourceFile);
  }

  @Permissions(`${VIEW.GROUP}.${VIEW.EMPLOYEE}`)
  @Get()
  async findAll(@Query() query: EmployeeQueryDto) {
    const employees = await this.employeeService.findAll(query);
    return {
      status: CORRECT,
      ...employees
    }
  }

  @Permissions(`${VIEW.GROUP}.${VIEW.EMPLOYEE}`)
  @Get(':id')
  async findOne(@Param('id', EntityExistsPipe(Employee)) employee: Employee) {
    return {
      status: CORRECT,
      data: employee
    }
  }

  @Permissions(`${UPDATE.GROUP}.${UPDATE.EMPLOYEE}`)
  @Patch('mass-change-status')
  async massChangeStatus(@Body() params: any) {
    const { selected, status } = params
    const response = await this.employeeService.massChangeStatus(selected, status);
    if (CORRECT === response) {
      return { status: CORRECT }
    }
    return response
  }
  
  @Permissions(`${UPDATE.GROUP}.${UPDATE.EMPLOYEE}`)
  @Patch(':id')
  async update(
    @Param('id', EntityExistsPipe(Employee)) employee: Employee,
    @Body() updateEmployeeDto: UpdateEmployeeDto
  ) {
    const response = await this.employeeService.update(employee, updateEmployeeDto);
    if (CORRECT === response) {
      return { status: CORRECT }
    }
    return response
  }

  @Permissions(`${DELETE.GROUP}.${DELETE.EMPLOYEE}`)
  @Delete(':id')
  async remove(
    @ActiveUser() user: any, 
    @Param('id', EntityExistsPipe(Employee)) employee: Employee
  ) {
    const response = await this.employeeService.remove(employee);
    if (CORRECT === response) {
      return { status: CORRECT }
    }
    return response
  }
}
