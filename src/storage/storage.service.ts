import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageAdapter, StorageUploadResult } from './storage-adapter.interface';
import { MinioStorageAdapter } from './adapters/minio-storage.adapter';

export type StorageDriver = 'minio' | 'local';

export class FileData {
  file: Express.Multer.File;
  key: string;
}

@Injectable()
export class StorageService implements StorageAdapter {
  private readonly adapter: StorageAdapter;

  constructor(
    config: ConfigService,
    minioAdapter: MinioStorageAdapter,
  ) {
    const driver = config.get<StorageDriver>('STORAGE_DRIVER', 'minio');
    this.adapter = minioAdapter;
  }

  uploadFile(fileData: FileData): Promise<StorageUploadResult> {
    return this.adapter.uploadFile(fileData);
  }

  getUrl(key: string, bucket: string): Promise<string> {
    return this.adapter.getUrl(key, bucket);
  }
}
