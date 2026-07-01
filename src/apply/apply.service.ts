import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ApplyDto } from './apply.dto';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class ApplyService {
  constructor(
    private readonly mailer: MailerService,
    private readonly storage: StorageService,
  ) { }

  async sendApplication(
    dto: ApplyDto,
    files: { file_cv?: Express.Multer.File[]; file_video?: Express.Multer.File[] },
  ) {
    const links: { label: string; url: string }[] = [];

    if (files.file_cv?.[0]) {
      const { key, bucket } = await this.storage.uploadFile(files.file_cv[0]);
      links.push({ label: 'CV', url: await this.storage.getUrl(key, bucket) });
    }

    if (files.file_video?.[0]) {
      const { key, bucket } = await this.storage.uploadFile(
        files.file_video[0],
      );
      links.push({
        label: 'Vidéo',
        url: await this.storage.getUrl(key, bucket),
      });
    }


   try {
     await this.mailer.sendMail({
      to: process.env.MAIL_TO ?? 'hi@selys-africa.com',
      cc: process.env.MAIL_CC ?? 'apastes@selys-africa.com',
      subject: `Candidature — ${dto.fullName}`,
      html: `
        <h2>Candidature : ${dto.fullName}</h2>
        <p><b>Email :</b> ${dto.email}</p>
        <p><b>Téléphone :</b> ${dto.phone}</p>
        <p><b>Expérience :</b> ${dto.experience}</p>
        <hr>
        <h3>Lettre de motivation</h3>
        <p>${dto.coverLetter.replace(/\n/g, '<br>')}</p>
        ${links.length
          ? `<hr><h3>Pièces jointes</h3><ul>${links
            .map(
              (l) =>
                `<li><a href="${l.url}">${l.label}</a> (lien valable ${process.env.MINIO_PRESIGNED_URL_LIFETIME ?? 3600}s)</li>`,
            )
            .join('')}</ul>`
          : ''
        }
      `,
    });
   } catch (error) {
    throw error
   }
  }
}
