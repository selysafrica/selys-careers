import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { MinioStorageAdapter } from './adapters/minio-storage.adapter';

@Module({
  providers: [MinioStorageAdapter, StorageService],
  exports: [StorageService],
})
export class StorageModule { }
