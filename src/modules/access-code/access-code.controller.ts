import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AccessCodeService } from './access-code.service';
import { CreateAccessCodeDto } from './dto/create-access-code.dto';
import { UpdateAccessCodeDto } from './dto/update-access-code.dto';
import { Permissions } from 'src/middlewares/iam/authorization/decorators/permission.decoration';
import { CORRECT } from 'src/assets/configs/app.constant';
import { CREATE, VIEW, UPDATE, DELETE } from 'src/assets/configs/app.permission';
import { EntityExistsPipe } from 'src/middlewares/globals/entity-exists.pipe';
import { Auth } from 'src/middlewares/iam/authentication/decorators/auth.decorator';
import { AuthType } from 'src/middlewares/iam/authentication/enums/auth-type.enum';
import { AccessCodeQueryDto } from './dto/query-access-code.dto';
import { AccessCode } from './entities/access-code.entity';

@Auth(AuthType.Bearer)
@Controller('access-code')
export class AccessCodeController {
  constructor(private readonly accessCodeService: AccessCodeService) {}

  @Permissions(`${CREATE.GROUP}.${VIEW.ACCESS_CODE}`)
  @Post()
  async create(@Body() createAccessCodeDto: CreateAccessCodeDto) {
    const response = await this.accessCodeService.create(createAccessCodeDto);
    if (CORRECT === response) {
      return { status: CORRECT }
    }
    return response
  }

  @Permissions(`${VIEW.GROUP}.${VIEW.ACCESS_CODE}`)
  @Get()
  async findAll(@Query() query: AccessCodeQueryDto) {
    const accessCode = await this.accessCodeService.findAll(query);
    
    return {
      status: CORRECT,
      ...accessCode
    }
  }

  @Permissions(`${VIEW.GROUP}.${VIEW.ACCESS_CODE}`)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const accessCode = await this.accessCodeService.findOne(id);
    return accessCode
  }

  @Permissions(`${UPDATE.GROUP}.${UPDATE.ACCESS_CODE}`)
  @Patch(':id')
  async update(
    @Param('id', EntityExistsPipe(AccessCode)) accessCode: AccessCode, 
    @Body() updateAccessCodeDto: UpdateAccessCodeDto
  ) {
    const response = await this.accessCodeService.update(accessCode, updateAccessCodeDto);
    if (CORRECT === response) {
      return { status: CORRECT }
    }
    return response
  }

  @Permissions(`${DELETE.GROUP}.${DELETE.ACCESS_CODE}`)
  @Delete(':id')
  async remove(@Param('id', EntityExistsPipe(AccessCode)) accessCode: AccessCode) {
    const response = await this.accessCodeService.remove(accessCode);
    if (CORRECT === response) {
      return { status: CORRECT }
    }
    return response
  }
}
