import { Readable } from "stream";

export abstract class IStorageService {
  abstract uploadFile(
    filePath: string,
    fileBuffer: Buffer,
    contentType: string,
  ): Promise<string>;
  abstract downloadFile(filePath: string): Promise<Buffer>;
  abstract deleteFile(filePaths: string | string[]): Promise<void>;
  abstract listFiles(prefix?: string): Promise<string[]>;
  abstract getFileStream(filePath: string): Promise<Readable>;
}
