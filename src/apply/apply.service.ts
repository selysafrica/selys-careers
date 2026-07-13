import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplyDto } from './apply.dto';
import { FileData, StorageService } from '../storage/storage.service';
import { Application } from '../entities/application.entity';

@Injectable()
export class ApplyService {
  constructor(
    private readonly mailer: MailerService,
    private readonly storage: StorageService,
    @InjectRepository(Application)
    private readonly applicationRepo: Repository<Application>,
  ) { }

  async sendApplication(
    dto: ApplyDto,
    files: { file_cv?: Express.Multer.File[]; file_video?: Express.Multer.File[] },
  ) {
    this.run(dto, files);
    return { success: true, message: 'Candidature envoyée avec succès.' };
  }

  async run(
    dto: ApplyDto,
    files: { file_cv?: Express.Multer.File[]; file_video?: Express.Multer.File[] },
  ) {
    try {
      const application = this.applicationRepo.create({
        fullName: dto.fullName,
        email: dto.email,
        phone: dto.phone,
        experience: dto.experience,
        coverLetter: dto.coverLetter,
      });

      let today = new Date().toISOString();

      if (files.file_cv?.[0]) {
        const fileData: FileData = {
          file: files.file_cv[0],
          key: `${today} - ${dto.fullName}/cv/${files.file_cv[0].originalname}`,
        };
        const { key, bucket } = await this.storage.uploadFile(fileData);
        application.cvKey = key;
        application.cvUrl = await this.storage.getUrl(key, bucket);
      }

      if (files.file_video?.[0]) {
        const fileData: FileData = {
          file: files.file_video[0],
          key: `${today} - ${dto.fullName}/video/${files.file_video[0].originalname}`,
        };
        const { key, bucket } = await this.storage.uploadFile(fileData);
        application.videoKey = key;
        application.videoUrl = await this.storage.getUrl(key, bucket);
      }

      await this.applicationRepo.save(application);

      const cvLink = application.cvUrl
        ? { url: application.cvUrl }
        : null;
      const videoLink = application.videoUrl
        ? { url: application.videoUrl }
        : null;

      const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Candidature — ${dto.fullName}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:Inter,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:40px 0">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
          <tr>
            <td style="background:linear-gradient(135deg,#031314 0%,#0f7d84 100%);border-radius:16px 16px 0 0;padding:36px 40px;text-align:center">
              <p style="margin:0 0 16px;color:rgba(84,221,212,.8);font-size:11px;font-weight:800;letter-spacing:.18em;text-transform:uppercase">Nouvelle candidature · Abidjan</p>
              <h1 style="margin:0;color:#f8fffd;font-size:22px;font-weight:800;line-height:1.3">Directeur du Pôle Web Management</h1>
              <p style="margin:10px 0 0;color:rgba(248,255,253,.6);font-size:13px">SELYS AFRICA</p>
            </td>
          </tr>
          <tr>
            <td style="background:#ffffff;padding:36px 40px">
              <h2 style="margin:0 0 20px;font-size:15px;font-weight:800;color:#031314;text-transform:uppercase;letter-spacing:.08em;border-bottom:2px solid #54ddd4;padding-bottom:8px">Informations du candidat</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px">
                <tr>
                  <td style="padding:10px 14px;background:#f8fffe;border-radius:10px 10px 0 0;border-bottom:1px solid #e8f8f7;width:38%">
                    <span style="font-size:11px;font-weight:700;color:#0f7d84;text-transform:uppercase;letter-spacing:.1em">Nom complet</span>
                  </td>
                  <td style="padding:10px 14px;background:#f8fffe;border-radius:10px 10px 0 0;border-bottom:1px solid #e8f8f7">
                    <span style="font-size:14px;font-weight:700;color:#031314">${dto.fullName}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 14px;background:#fff;border-bottom:1px solid #f0f0f0">
                    <span style="font-size:11px;font-weight:700;color:#0f7d84;text-transform:uppercase;letter-spacing:.1em">Email</span>
                  </td>
                  <td style="padding:10px 14px;background:#fff;border-bottom:1px solid #f0f0f0">
                    <a href="mailto:${dto.email}" style="font-size:14px;color:#0f7d84;text-decoration:none">${dto.email}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 14px;background:#f8fffe;border-bottom:1px solid #e8f8f7">
                    <span style="font-size:11px;font-weight:700;color:#0f7d84;text-transform:uppercase;letter-spacing:.1em">Téléphone</span>
                  </td>
                  <td style="padding:10px 14px;background:#f8fffe;border-bottom:1px solid #e8f8f7">
                    <a href="tel:${dto.phone}" style="font-size:14px;color:#031314;text-decoration:none">${dto.phone}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 14px;background:#fff;border-radius:0 0 10px 10px">
                    <span style="font-size:11px;font-weight:700;color:#0f7d84;text-transform:uppercase;letter-spacing:.1em">Expérience</span>
                  </td>
                  <td style="padding:10px 14px;background:#fff;border-radius:0 0 10px 10px">
                    <span style="font-size:14px;color:#031314">${dto.experience}</span>
                  </td>
                </tr>
              </table>
              <h2 style="margin:0 0 14px;font-size:15px;font-weight:800;color:#031314;text-transform:uppercase;letter-spacing:.08em;border-bottom:2px solid #54ddd4;padding-bottom:8px">Lettre de motivation</h2>
              <div style="background:#f8fffe;border-left:3px solid #54ddd4;border-radius:0 10px 10px 0;padding:18px 20px;margin-bottom:28px;font-size:14px;color:#2c2c2c;line-height:1.75">
                ${dto.coverLetter.replace(/\n/g, '<br>')}
              </div>
              ${cvLink || videoLink
          ? `<h2 style="margin:0 0 14px;font-size:15px;font-weight:800;color:#031314;text-transform:uppercase;letter-spacing:.08em;border-bottom:2px solid #54ddd4;padding-bottom:8px">Pièces jointes</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px">
                ${cvLink ? `<tr><td style="padding:8px 0"><a href="${cvLink.url}" style="display:inline-block;background:linear-gradient(135deg,#0f7d84,#54ddd4);color:#fff;font-size:13px;font-weight:800;text-decoration:none;padding:12px 24px;border-radius:10px">Télécharger le CV</a></td></tr>` : ''}
                ${videoLink ? `<tr><td style="padding:8px 0"><a href="${videoLink.url}" style="display:inline-block;background:linear-gradient(135deg,#031314,#0f7d84);color:#fff;font-size:13px;font-weight:800;text-decoration:none;padding:12px 24px;border-radius:10px">Visionner la vidéo</a></td></tr>` : ''}
              </table>`
          : `<p style="font-size:13px;color:#999;font-style:italic">Aucune pièce jointe fournie.</p>`
        }
            </td>
          </tr>
          <tr>
            <td style="background:#031314;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center">
              <p style="margin:0;color:rgba(248,255,253,.45);font-size:11px;line-height:1.7">
                SELYS AFRICA — Nos innovations vous distinguent.<br>
                Ce message a été généré automatiquement depuis <a href="https://postule.selys.app" style="color:#54ddd4;text-decoration:none">postule.selys.app</a>.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

      await this.mailer.sendMail({
        to: process.env.MAIL_TO ?? 'hi@selys-africa.com',
        cc: process.env.MAIL_CC ?? 'apastes@selys-africa.com',
        subject: `🎯 Candidature — ${dto.fullName} · Directeur Pôle Web`,
        html,
      });
    } catch (error) {
      console.error(
        `Erreur lors de l'envoi de la candidature: ${error instanceof Error ? error.message : error}`,
      );
      throw error;
    }
  }
}
