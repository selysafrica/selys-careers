import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ApplyDto } from './apply.dto';

@Injectable()
export class ApplyService {
  constructor(private readonly mailer: MailerService) {}

  async sendApplication(
    body: ApplyDto,
    files: { cv?: Express.Multer.File[]; video?: Express.Multer.File[] },
  ) {
    const attachments: { filename: string; content: Buffer }[] = [];

    if (files.cv?.[0]) {
      attachments.push({
        filename: files.cv[0].originalname,
        content: files.cv[0].buffer,
      });
    }

    if (files.video?.[0]) {
      attachments.push({
        filename: files.video[0].originalname,
        content: files.video[0].buffer,
      });
    }

    await this.mailer.sendMail({
      to: process.env.MAIL_TO ?? 'hi@selys-africa.com',
      cc: process.env.MAIL_CC ?? 'apastes@selys-africa.com',
      subject: `Candidature Directeur Pôle Web — ${body.fullName}`,
      html: `
        <h2>Candidature : ${body.fullName}</h2>
        <p><b>Email :</b> ${body.email}</p>
        <p><b>Téléphone :</b> ${body.phone}</p>
        <p><b>Expérience :</b> ${body.experience}</p>
        <hr>
        <h3>Lettre de motivation</h3>
        <p>${body.coverLetter.replace(/\n/g, '<br>')}</p>
      `,
      attachments,
    });
  }
}
