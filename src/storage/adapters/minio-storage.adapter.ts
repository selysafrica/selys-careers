import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import {
  StorageAdapter,
  StorageUploadResult,
} from '../storage-adapter.interface';

@Injectable()
export class MinioStorageAdapter implements StorageAdapter {
  private readonly client: S3Client;
  private readonly privateBucket: string;
  private readonly publicBucket: string;
  private readonly presignedUrlLifetime: number;

  constructor(private readonly config: ConfigService) {
    this.privateBucket = this.config.get<string>(
      'MINIO_PRIVATE_BUCKET_NAME',
    )!;

    this.publicBucket = this.config.get<string>(
      'MINIO_PUBLIC_BUCKET_NAME',
    )!;
    this.presignedUrlLifetime = this.config.get<number>(
      'MINIO_PRESIGNED_URL_LIFETIME',
      3600,
    );

    this.client = new S3Client({
      region: this.config.get('MINIO_REGION', 'us-east-1'),
      endpoint: this.config.get('MINIO_PUBLIC_BUCKET_ENDPOINT'),
      forcePathStyle: true,
      credentials: {
        accessKeyId: this.config.get('MINIO_ACCESS_KEY_ID')!,
        secretAccessKey: this.config.get('MINIO_SECRET_ACCESS_KEY')!,
      },
    });
  }

  private generateKey(file: Express.Multer.File): string {
    return `candidatures/${randomUUID()}-${file.originalname}`;
  }

  async uploadFile(file: Express.Multer.File): Promise<StorageUploadResult> {
    const key = this.generateKey(file);

    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.publicBucket,
          Key: key,
          Body: file.buffer,
          ContentLength: file.size,
          ContentType: file.mimetype,
          Metadata: { originalName: file.originalname },
        }),
      );

      return { key, bucket: this.publicBucket };
    } catch (error) {
      throw new InternalServerErrorException(
        `Erreur lors de l'upload du fichier`,
      );
    }
  }

  async getUrl(key: string, bucket = this.publicBucket): Promise<string> {
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    return getSignedUrl(this.client, command, {
      expiresIn: this.presignedUrlLifetime,
    });
  }
}
