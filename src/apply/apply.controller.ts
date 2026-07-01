import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  Body,
  HttpException,
  HttpStatus,
  Query,
  ParseBoolPipe,
} from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage, memoryStorage } from 'multer';
import { ApplyService } from './apply.service';
import { ApplyDto } from './apply.dto';
import { extname } from 'path';

@Controller('api')
export class ApplyController {
  constructor(private readonly applyService: ApplyService) { }

  @Post('apply')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'file_cv', maxCount: 1},
        { name: 'file_video', maxCount: 1 }
      ],
      {
        storage: memoryStorage(),
        limits: { fileSize: 50 * 1024 * 1024 }, // ajuste selon besoin
      },
    ),
  )
  // @UseInterceptors(FileInterceptor('files'))
  async apply(
    @Body() dto: ApplyDto,
    @UploadedFiles() files: Record<string, Express.Multer.File[]>,
  ) {
    try {
      await this.applyService.sendApplication(dto, files as any);
      return { success: true, message: 'Candidature envoyée avec succès.' };
    } catch (error) {
      throw new HttpException(
        'Erreur lors de l\'envoi. Veuillez réessayer.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


}
