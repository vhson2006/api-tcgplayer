import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Auth } from 'src/middlewares/iam/authentication/decorators/auth.decorator';
import { AuthType } from 'src/middlewares/iam/authentication/enums/auth-type.enum';
import { RoleQueryDto } from './dto/query-role.dto';
import { CORRECT } from 'src/assets/configs/app.constant';
import { CREATE, DELETE, UPDATE, VIEW } from 'src/assets/configs/app.permission';
import { Permissions } from 'src/middlewares/iam/authorization/decorators/permission.decoration';
import { EntityExistsPipe } from 'src/middlewares/globals/entity-exists.pipe';
import { Role } from './entities/role.entity';

@Auth(AuthType.Bearer)
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}
  
  @Permissions(`${CREATE.GROUP}.${VIEW.ROLE}`)
  @Post()
  async create(@Body() createRoleDto: CreateRoleDto) {
    const response = await this.roleService.create(createRoleDto);
    if (CORRECT === response) {
      return { status: CORRECT }
    }
    return response
  }

  @Permissions(`${VIEW.GROUP}.${VIEW.ROLE}`)
  @Get()
  async findAll(@Query() query: RoleQueryDto) {
    const roles = await this.roleService.findAll(query);
    return {
      status: CORRECT,
      ...roles
    }
  }

  @Permissions(`${VIEW.GROUP}.${VIEW.ROLE}`)
  @Get(':id')
  async findOne(@Param('id', EntityExistsPipe(Role)) role: Role) {
    return {
      status: CORRECT,
      data: role
    }
  }

  @Permissions(`${UPDATE.GROUP}.${UPDATE.ROLE}`)
  @Patch(':id')
  async update(
    @Param('id', EntityExistsPipe(Role)) role: Role, 
    @Body() updateRoleDto: UpdateRoleDto
  ) {
    const response = await this.roleService.update(role, updateRoleDto);
    if (CORRECT === response) {
      return { status: CORRECT }
    }
    return response
  }

  @Permissions(`${DELETE.GROUP}.${DELETE.ROLE}`)
  @Delete(':id')
  async remove(@Param('id', EntityExistsPipe(Role)) role: Role) {
    const response = await this.roleService.remove(role);
    if (CORRECT === response) {
      return { status: CORRECT }
    }
    return response
  }
}
