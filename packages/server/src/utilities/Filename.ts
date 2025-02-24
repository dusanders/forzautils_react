import { RecordedFile } from "@forzautils/core";
import FS from 'fs-extra';;
const { readdir } = FS;

export class FilenameUtils {
  static getFilename(trackId: number, packetLen: number): string {
    return `${Date.now()}:${trackId}:${packetLen}`;
  }
  static async parseDir(dir: string) {
    const allFiles = await readdir(dir);;
    const playbackFiles: RecordedFile[] = [];
    for(const file of allFiles) {
      const parsed = this.parseFilename(file);
      if(parsed) {
        playbackFiles.push(parsed);
      }
    }
    return playbackFiles;
  }
  static parseFilename(filename: string): RecordedFile | undefined {
    const segments = filename.split(':');
    if(segments.length !== 3) {
      return undefined;
    }
    return {
      filename: filename,
      packetLen: Number.parseInt(segments[2]),
      trackId: Number.parseInt(segments[1]),
      date: Number.parseInt(segments[0]),
    }
  }
}