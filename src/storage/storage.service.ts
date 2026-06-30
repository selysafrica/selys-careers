import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageAdapter, StorageUploadResult } from './storage-adapter.interface';
import { MinioStorageAdapter } from './adapters/minio-storage.adapter';
import { LocalStorageAdapter } from './adapters/local-storage.adapter';

export type StorageDriver = 'minio' | 'local';

@Injectable()
export class StorageService implements StorageAdapter {
  private readonly adapter: StorageAdapter;

  constructor(
    config: ConfigService,
    minioAdapter: MinioStorageAdapter,
    localAdapter: LocalStorageAdapter,
  ) {
    const driver = config.get<StorageDriver>('STORAGE_DRIVER', 'minio');
    this.adapter = driver === 'local' ? localAdapter : minioAdapter;
  }

  uploadFile(file: Express.Multer.File): Promise<StorageUploadResult> {
    return this.adapter.uploadFile(file);
  }

  getUrl(key: string, bucket: string): Promise<string> {
    return this.adapter.getUrl(key, bucket);
  }
}
