export interface StorageUploadResult {
  key: string;
  bucket: string;
}

export interface StorageAdapter {
  uploadFile(file: Express.Multer.File): Promise<StorageUploadResult>;
  getUrl(key: string, bucket: string): Promise<string>;
}
