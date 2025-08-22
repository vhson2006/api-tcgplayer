import { PartialType } from '@nestjs/swagger';
import { CreateAccessCodeDto } from './create-access-code.dto';

export class UpdateAccessCodeDto extends PartialType(CreateAccessCodeDto) {}
