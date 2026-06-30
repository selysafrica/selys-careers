import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { MinioStorageAdapter } from './adapters/minio-storage.adapter';
import { LocalStorageAdapter } from './adapters/local-storage.adapter';

@Module({
  providers: [MinioStorageAdapter, LocalStorageAdapter, StorageService],
  exports: [StorageService],
})
export class StorageModule {}
