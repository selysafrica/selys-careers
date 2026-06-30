import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import {
  StorageAdapter,
  StorageUploadResult,
} from '../storage-adapter.interface';

@Injectable()
export class LocalStorageAdapter implements StorageAdapter {
  private readonly rootDir: string;
  private readonly bucket = 'local';

  constructor(private readonly config: ConfigService) {
    this.rootDir = this.config.get<string>(
      'LOCAL_STORAGE_DIR',
      join(process.cwd(), 'documents'),
    );
  }

  private generateKey(file: Express.Multer.File): string {
    return `${randomUUID()}-${file.originalname}`;
  }

  async uploadFile(file: Express.Multer.File): Promise<StorageUploadResult> {
    const key = this.generateKey(file);

    try {
      await mkdir(this.rootDir, { recursive: true });
      await writeFile(join(this.rootDir, key), file.buffer);
      return { key, bucket: this.bucket };
    } catch (error) {
      throw new InternalServerErrorException(
        `Erreur lors de l'upload du fichier`,
      );
    }
  }

  async getUrl(key: string): Promise<string> {
    return join(this.rootDir, key);
  }
}
