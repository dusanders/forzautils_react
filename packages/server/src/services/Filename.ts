
export interface IForzaFile {
  trackId: string;
  date: string;
  packetLength: string;
}

export interface IFilename {
  getFilename(trackId: string, packetLen: number): string;
  parseFilename(filename: string): IForzaFile;
}

export class Filename implements IFilename {
  getFilename(trackId: string, packetLen: number): string {
    return `${Date.now}:${trackId}:${packetLen}`;
  }
  parseFilename(filename: string): IForzaFile {
    const segments = filename.split(':');
    return {
      packetLength: segments[2],
      trackId: segments[1],
      date: segments[0]
    }
  }
}