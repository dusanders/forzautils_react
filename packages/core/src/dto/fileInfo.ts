
export interface RecordedFilesQuery {
  rangeStart?: number;
  rangeEnd?: number;
}

export interface RecordedFile {
  filename: string;
  date: string;
  packetLen: string;
  trackId: string;
}