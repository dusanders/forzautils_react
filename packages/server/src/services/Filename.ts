import { RecordedFile } from "@forzautils/core";


export interface IFilename {
  getFilename(trackId: string, packetLen: number): string;
  parseFilename(filename: string): RecordedFile;
}

export class Filename implements IFilename {
  getFilename(trackId: string, packetLen: number): string {
    return `${Date.now}:${trackId}:${packetLen}`;
  }
  parseFilename(filename: string): RecordedFile {
    const segments = filename.split(':');
    return {
      filename: filename,
      packetLen: segments[2],
      trackId: segments[1],
      date: segments[0]
    }
  }
}