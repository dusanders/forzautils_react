import FS from 'fs-extra';

export interface IFileReader {
  open(filepath: string): Promise<void>;
  getNextPacket(packetLen: number): Promise<Buffer<ArrayBufferLike> | null>;
  close(): void;
}

export class FileReader implements IFileReader {
  private stream?: FS.ReadStream;

  async open(filepath: string): Promise<void> {
    if(!FS.existsSync(filepath)) {
      throw new Error(`Failed to open file ${filepath} -- does not exist`);
    }
    this.stream = FS.createReadStream(filepath);
  }

  async getNextPacket(packetLen: number): Promise<Buffer<ArrayBufferLike> | null> {
    if(!this.stream) {
      throw new Error(`Failed to get packet - no stream open`);
    }
    const packet = this.stream.read(packetLen);
    return packet;
  }

  close(): void {
    this.stream?.close();
    this.stream = undefined;
  }
}