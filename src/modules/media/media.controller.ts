import { Controller, Post, UploadedFile, UseInterceptors, UploadedFiles, Inject, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, Body, Delete, Get, Param, Patch, Query } from '@nestjs/common';
import { MediaService } from './media.service';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { CORRECT, INCORRECT } from 'src/assets/configs/app.constant';
import { Permissions } from 'src/middlewares/iam/authorization/decorators/permission.decoration';
import { CREATE, VIEW, UPDATE, DELETE } from 'src/assets/configs/app.permission';
import { EntityExistsPipe } from 'src/middlewares/globals/entity-exists.pipe';
import { Auth } from 'src/middlewares/iam/authentication/decorators/auth.decorator';
import { AuthType } from 'src/middlewares/iam/authentication/enums/auth-type.enum';
import { CreateMediaDto } from './dto/create-media.dto';
import { MediaQueryDto } from './dto/query-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { Media } from './entities/media.entity';

@Auth(AuthType.Bearer)
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Permissions(`${CREATE.GROUP}.${VIEW.MEDIA}`)
  @Post()
  async create(@Body() createMediaDto: CreateMediaDto) {
    const response = await this.mediaService.create(createMediaDto);
    if (CORRECT === response) {
      return { status: CORRECT }
    }
    return response
  }

  @Permissions(`${VIEW.GROUP}.${VIEW.MEDIA}`)
  @Get()
  async findAll(@Query() query: MediaQueryDto) {
    const media = await this.mediaService.findAll(query);
    
    return {
      status: CORRECT,
      ...media
    }
  }

  @Permissions(`${VIEW.GROUP}.${VIEW.MEDIA}`)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const media = await this.mediaService.findOne(id);
    return media
  }

  @Permissions(`${UPDATE.GROUP}.${UPDATE.MEDIA}`)
  @Patch(':id')
  async update(
    @Param('id', EntityExistsPipe(Media)) media: Media, 
    @Body() updateMediaDto: UpdateMediaDto
  ) {
    const response = await this.mediaService.update(media, updateMediaDto);
    if (CORRECT === response) {
      return { status: CORRECT }
    }
    return response
  }

  @Permissions(`${DELETE.GROUP}.${DELETE.MEDIA}`)
  @Delete(':id')
  async remove(@Param('id', EntityExistsPipe(Media)) media: Media) {
    const response = await this.mediaService.remove(media);
    if (CORRECT === response) {
      return { status: CORRECT }
    }
    return response
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile(
    new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator({ maxSize: 10000000 }), // 10MB
        new FileTypeValidator({ fileType: 'image/jpeg' }),
      ]
    })
  ) file: Express.Multer.File): Promise<any> {
    const media = await this.mediaService.upload(file);
    if (INCORRECT === media) {
      return {
        status: INCORRECT,
        message: ''
      }
    }
    return {
      status: CORRECT,
      ...media
    }
  }

  @Post('uploads')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'files', maxCount: 5 }]))
  async uploadFiles(@UploadedFiles(
    new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator({ maxSize: 100000000 }), // 100MB
        new FileTypeValidator({ fileType: 'image/jpeg' }),
      ]
    })
  ) files: { files?: Express.Multer.File[] }): Promise<any> {
    console.log(files)
    
    const media = await this.mediaService.uploads(files.files);
    if (INCORRECT === media) {
      return {
        status: INCORRECT,
        message: ''
      }
    }
    return {
      status: CORRECT,
      ...media
    }
  }

}
