import { PartialType } from '@nestjs/swagger';
import { CreateGenerateDto } from './create-generate.dto';

export class UpdateGenerateDto extends PartialType(CreateGenerateDto) {}
