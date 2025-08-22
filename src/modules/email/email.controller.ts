import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { EmailService } from './email.service';
import { CreateEmailDto } from './dto/create-email.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { Permissions } from 'src/middlewares/iam/authorization/decorators/permission.decoration';
import { CORRECT } from 'src/assets/configs/app.constant';
import { CREATE, VIEW, UPDATE, DELETE } from 'src/assets/configs/app.permission';
import { EntityExistsPipe } from 'src/middlewares/globals/entity-exists.pipe';
import { Auth } from 'src/middlewares/iam/authentication/decorators/auth.decorator';
import { AuthType } from 'src/middlewares/iam/authentication/enums/auth-type.enum';
import { EmailQueryDto } from './dto/query-email.dto';
import { Email } from './entities/email.entity';

@Auth(AuthType.Bearer)
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Permissions(`${CREATE.GROUP}.${VIEW.EMAIL}`)
  @Post()
  async create(@Body() createEmailDto: CreateEmailDto) {
    const response = await this.emailService.create(createEmailDto);
    if (CORRECT === response) {
      return { status: CORRECT }
    }
    return response
  }

  @Permissions(`${VIEW.GROUP}.${VIEW.EMAIL}`)
  @Get()
  async findAll(@Query() query: EmailQueryDto) {
    const email = await this.emailService.findAll(query);
    
    return {
      status: CORRECT,
      ...email
    }
  }

  @Permissions(`${VIEW.GROUP}.${VIEW.EMAIL}`)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const email = await this.emailService.findOne(id);
    return email
  }

  @Permissions(`${UPDATE.GROUP}.${UPDATE.EMAIL}`)
  @Patch(':id')
  async update(
    @Param('id', EntityExistsPipe(Email)) email: Email, 
    @Body() updateEmailDto: UpdateEmailDto
  ) {
    const response = await this.emailService.update(email, updateEmailDto);
    if (CORRECT === response) {
      return { status: CORRECT }
    }
    return response
  }

  @Permissions(`${DELETE.GROUP}.${DELETE.EMAIL}`)
  @Delete(':id')
  async remove(@Param('id', EntityExistsPipe(Email)) email: Email) {
    const response = await this.emailService.remove(email);
    if (CORRECT === response) {
      return { status: CORRECT }
    }
    return response
  }
}
