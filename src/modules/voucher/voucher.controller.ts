import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { Permissions } from 'src/middlewares/iam/authorization/decorators/permission.decoration';
import { CORRECT } from 'src/assets/configs/app.constant';
import { CREATE, VIEW, UPDATE, DELETE } from 'src/assets/configs/app.permission';
import { EntityExistsPipe } from 'src/middlewares/globals/entity-exists.pipe';
import { Auth } from 'src/middlewares/iam/authentication/decorators/auth.decorator';
import { AuthType } from 'src/middlewares/iam/authentication/enums/auth-type.enum';
import { VoucherQueryDto } from './dto/query-voucher.dto';
import { Voucher } from './entities/voucher.entity';

@Auth(AuthType.Bearer)
@Controller('voucher')
export class VoucherController {
  constructor(private readonly voucherService: VoucherService) {}

  @Permissions(`${CREATE.GROUP}.${VIEW.VOUCHER}`)
  @Post()
  async create(@Body() createVoucherDto: CreateVoucherDto) {
    const response = await this.voucherService.create(createVoucherDto);
    if (CORRECT === response) {
      return { status: CORRECT }
    }
    return response
  }

  @Permissions(`${VIEW.GROUP}.${VIEW.VOUCHER}`)
  @Get()
  async findAll(@Query() query: VoucherQueryDto) {
    const voucher = await this.voucherService.findAll(query);
    
    return {
      status: CORRECT,
      ...voucher
    }
  }

  @Permissions(`${VIEW.GROUP}.${VIEW.VOUCHER}`)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const voucher = await this.voucherService.findOne(id);
    return voucher
  }

  @Permissions(`${UPDATE.GROUP}.${UPDATE.VOUCHER}`)
  @Patch(':id')
  async update(
    @Param('id', EntityExistsPipe(Voucher)) voucher: Voucher, 
    @Body() updateVoucherDto: UpdateVoucherDto
  ) {
    const response = await this.voucherService.update(voucher, updateVoucherDto);
    if (CORRECT === response) {
      return { status: CORRECT }
    }
    return response
  }

  @Permissions(`${DELETE.GROUP}.${DELETE.VOUCHER}`)
  @Delete(':id')
  async remove(@Param('id', EntityExistsPipe(Voucher)) voucher: Voucher) {
    const response = await this.voucherService.remove(voucher);
    if (CORRECT === response) {
      return { status: CORRECT }
    }
    return response
  }
}
