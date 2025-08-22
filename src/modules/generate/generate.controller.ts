import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { GenerateService } from './generate.service';
import { CreateGenerateDto } from './dto/create-generate.dto';
import { UpdateGenerateDto } from './dto/update-generate.dto';
import { Permissions } from 'src/middlewares/iam/authorization/decorators/permission.decoration';
import { CORRECT } from 'src/assets/configs/app.constant';
import { CREATE, VIEW, UPDATE, DELETE } from 'src/assets/configs/app.permission';
import { EntityExistsPipe } from 'src/middlewares/globals/entity-exists.pipe';
import { Auth } from 'src/middlewares/iam/authentication/decorators/auth.decorator';
import { AuthType } from 'src/middlewares/iam/authentication/enums/auth-type.enum';
import { GenerateQueryDto } from './dto/query-generate.dto';
import { Generate } from './entities/generate.entity';

@Auth(AuthType.Bearer)
@Controller('generate')
export class GenerateController {
  constructor(private readonly generateService: GenerateService) {}

  @Permissions(`${CREATE.GROUP}.${VIEW.GENERATE}`)
  @Post()
  async create(@Body() createGenerateDto: CreateGenerateDto) {
    const response = await this.generateService.create(createGenerateDto);
    if (CORRECT === response) {
      return { status: CORRECT }
    }
    return response
  }

  @Permissions(`${VIEW.GROUP}.${VIEW.GENERATE}`)
  @Get()
  async findAll(@Query() query: GenerateQueryDto) {
    const generate = await this.generateService.findAll(query);
    
    return {
      status: CORRECT,
      ...generate
    }
  }

  @Permissions(`${VIEW.GROUP}.${VIEW.GENERATE}`)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const generate = await this.generateService.findOne(id);
    return generate
  }

  @Permissions(`${UPDATE.GROUP}.${UPDATE.GENERATE}`)
  @Patch(':id')
  async update(
    @Param('id', EntityExistsPipe(Generate)) generate: Generate, 
    @Body() updateGenerateDto: UpdateGenerateDto
  ) {
    const response = await this.generateService.update(generate, updateGenerateDto);
    if (CORRECT === response) {
      return { status: CORRECT }
    }
    return response
  }

  @Permissions(`${DELETE.GROUP}.${DELETE.GENERATE}`)
  @Delete(':id')
  async remove(@Param('id', EntityExistsPipe(Generate)) generate: Generate) {
    const response = await this.generateService.remove(generate);
    if (CORRECT === response) {
      return { status: CORRECT }
    }
    return response
  }
}
