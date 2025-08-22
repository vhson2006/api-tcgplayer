import { Controller, Get, Body, Patch } from '@nestjs/common';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Permissions } from 'src/middlewares/iam/authorization/decorators/permission.decoration';
import { CORRECT } from 'src/assets/configs/app.constant';
import { Auth } from 'src/middlewares/iam/authentication/decorators/auth.decorator';
import { AuthType } from 'src/middlewares/iam/authentication/enums/auth-type.enum';
import { CUSTOMER_TYPE } from 'src/assets/configs/app.common';
import { PublicCustomerService } from './public-customer.service';
import { ActiveUser } from 'src/middlewares/iam/authentication/decorators/active-user.decorator';

@Auth(AuthType.Bearer)
@Controller('public-customer')
export class PublicCustomerController {
  constructor(private readonly publicCustomerService: PublicCustomerService) {}

  @Permissions(CUSTOMER_TYPE.ACTIVED)
  @Get()
  async findOne(@ActiveUser() customer: any) {
    const response = await this.publicCustomerService.findOne(customer.sub);
    return response
  }

  @Permissions(CUSTOMER_TYPE.ACTIVED)
  @Patch()
  async update(
    @ActiveUser() customer: any, 
    @Body() updateCustomerDto: UpdateCustomerDto
  ) {
    const response = await this.publicCustomerService.update(customer, updateCustomerDto);
    if (CORRECT === response) {
      return { status: CORRECT }
    }
    return response
  }

}
