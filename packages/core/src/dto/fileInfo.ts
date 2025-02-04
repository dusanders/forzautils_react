
export interface RecordedFilesQuery {
  rangeStart?: number;
  rangeEnd?: number;
}

export interface RecordedFile {
  filename: string;
  date: number;
  packetLen: number;
  trackId: string;
}