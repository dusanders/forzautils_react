import { RecordedFile } from '@forzautils/core';
import FS from 'fs-extra';
import * as Path from 'path';
import { IRecordDataConfig } from '../types/ServerConfig.js';

export interface IFileReader {
  open(info: RecordedFile): Promise<void>;
  getNextPacket(): Promise<Buffer<ArrayBufferLike> | null>;
  close(): void;
}

export class FileReader implements IFileReader {
  private stream?: FS.ReadStream;
  private info?: RecordedFile;
  private parentDir: string;
  constructor(config: IRecordDataConfig) {
    this.parentDir = config.parentDir;
  }
  async open(info: RecordedFile): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.info = info;
      const filepath = Path.resolve(this.parentDir, info.filename);
      if(!FS.existsSync(filepath)) {
        reject(new Error(`Failed to open file ${filepath} -- does not exist`));
      }
      this.stream = FS.createReadStream(filepath);
      console.log(`Opened file ${filepath} for reading`);
      this.stream.on('readable', () => {
        console.log(`File ${filepath} is readable`);
        resolve();
      });
    });
  }

  async getNextPacket(): Promise<Buffer<ArrayBufferLike> | null> {
    if(!this.stream) {
      throw new Error(`Failed to get packet - no stream open`);
    }
    if(!this.info) {
      throw new Error(`Failed to read stream - file info undefined ${JSON.stringify(this.info)}`);
    }
    const packet = this.stream.read(this.info.packetLen);
    return packet;
  }

  close(): void {
    this.stream?.close();
    this.stream = undefined;
  }
}