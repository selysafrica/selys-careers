import { FileData } from "./storage.service";

export interface StorageUploadResult {
  key: string;
  bucket: string;
}

export interface StorageAdapter {
  uploadFile(fileData: FileData): Promise<StorageUploadResult>;
  getUrl(key: string, bucket: string): Promise<string>;
}
