import { RecordedFile } from "@forzautils/core";

export class FilenameUtils {
  static getFilename(trackId: number, packetLen: number): string {
    return `${Date.now()}:${trackId}:${packetLen}`;
  }
  static parseFilename(filename: string): RecordedFile {
    const segments = filename.split(':');
    return {
      filename: filename,
      packetLen: Number.parseInt(segments[2]),
      trackId: Number.parseInt(segments[1]),
      date: Number.parseInt(segments[0])
    }
  }
}