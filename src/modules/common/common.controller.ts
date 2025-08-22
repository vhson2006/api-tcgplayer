import { Controller, Get, Query } from '@nestjs/common';
import { CommonService } from './common.service';
import { Auth } from 'src/middlewares/iam/authentication/decorators/auth.decorator';
import { AuthType } from 'src/middlewares/iam/authentication/enums/auth-type.enum';
import { CommonQueryDto } from './dto/query-common.dto';
import { CORRECT } from 'src/assets/configs/app.constant';

@Auth(AuthType.Bearer)
@Controller('common')
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

  @Get()
  async findAll(@Query() query: CommonQueryDto) {
    const { group } = query
    const commons = await this.commonService.findAll(group);
    return { status: CORRECT, ...commons }
  }
}
