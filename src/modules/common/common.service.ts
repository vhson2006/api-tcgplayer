import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Common } from 'src/modules/common/entities/common.entity';
import { I18nService } from 'src/middlewares/globals/i18n/i18n.service';
import { Repository } from 'typeorm';

@Injectable()
export class CommonService {
  constructor(
    private readonly i18nService: I18nService,
    @InjectRepository(Common) private readonly commonRepository: Repository<Common>,
  ) {}

  async findAll(group: string) {
    try {
      const commons = await this.commonRepository.findBy({ group })
      return {
        data: commons,
        total: commons.length
      }
    } catch(e) {
      throw new BadRequestException(this.i18nService.translate('ERRORS.BAD_REQUEST'));
    }
  }
}
