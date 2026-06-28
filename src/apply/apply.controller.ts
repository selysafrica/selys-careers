import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApplyService } from './apply.service';
import { ApplyDto } from './apply.dto';

@Controller('api')
export class ApplyController {
  constructor(private readonly applyService: ApplyService) {}

  @Post('apply')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'cv', maxCount: 1 },
        { name: 'video', maxCount: 1 },
      ],
      { storage: memoryStorage() },
    ),
  )
  async apply(
    @Body() body: ApplyDto,
    @UploadedFiles()
    files: {
      cv?: Express.Multer.File[];
      video?: Express.Multer.File[];
    },
  ) {
    try {
      await this.applyService.sendApplication(body, files);
      return { success: true, message: 'Candidature envoyée avec succès.' };
    } catch {
      throw new HttpException(
        'Erreur lors de l\'envoi. Veuillez réessayer.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
