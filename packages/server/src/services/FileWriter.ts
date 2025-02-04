import FS from 'fs-extra';

export interface IFileWriter {
  isOpen: boolean;
  open(filepath: string): void;
  append(packet: Buffer<ArrayBufferLike>): void;
  end(): void;
}

export class FileWriter implements IFileWriter {
  private writeStream?: FS.WriteStream;
  private packetBuff: Buffer<ArrayBufferLike>[] = [];
  isOpen: boolean = false;

  open(filepath: string): void {
    this.writeStream = FS.createWriteStream(filepath);
    this.isOpen = true;
  }

  append(packet: Buffer<ArrayBufferLike>): void {
    if (!this.writeStream) {
      throw new Error('Must open file before appending data!');
    }
    this.packetBuff.push(packet);
    this.drain();
  }

  end(): void {
    while (this.packetBuff.length) {
      this.drain();
    }
    this.writeStream?.end();
    this.writeStream?.close();
    this.writeStream = undefined;
    this.isOpen = false;
  }

  private drain() {
    const chunk = this.packetBuff.shift();
    if (chunk) {
      if (!this.writeStream?.write(chunk)) {
        console.warn(`!!!! FILE BUFFER IS OVERFLOWING - WAIT FOR DRAIN !!!!`);
        this.writeStream?.once('drain', () => {
          this.drain();
        });
      }
    }
  }
}