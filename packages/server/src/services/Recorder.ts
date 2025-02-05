import FS from 'fs-extra';
const { existsSync, mkdirp, readdir } = FS;
import { IRecordDataConfig } from "../types/ServerConfig.js";
import * as Path from 'path';
import { FileWriter, IFileWriter } from './FileWriter.js';
import { FileReader, IFileReader } from './FileReader.js';
import { RecordedFile } from '@forzautils/core';
import { FilenameUtils } from '../utilities/Filename.js';
import { ForzaTelemetryApi } from 'ForzaTelemetryApi';

export interface IRecordData {
  isRecording: boolean;
  initialize(): Promise<void>;
  setRecording(state: boolean): void;
  getAllRecordings(): Promise<RecordedFile[]>;
  playback(filename: string): IFileReader;
  maybeWritePacket(buffer: Buffer<ArrayBufferLike>): void;
}

export class ForzaDataRecorder implements IRecordData {
  private config: IRecordDataConfig;
  private fileWriter: IFileWriter;
  private recordingTrackId?: number;
  private totalChunks: number = 0;
  isRecording: boolean;

  constructor(config: IRecordDataConfig) {
    this.config = config;
    this.isRecording = false;
    this.fileWriter = new FileWriter();
  }

  async initialize(): Promise<void> {
    const dataDir = Path.resolve(this.config.parentDir);
    if (!existsSync(dataDir)) {
      await mkdirp(dataDir);
    }
    const existingFiles = await readdir(dataDir);
    console.log(`Found ${existingFiles.length} recorded files in ${dataDir}`);
  }

  setRecording(state: boolean): void {
    if (state) this.startRecording();
    else this.stopRecording();
  }

  private startRecording(): void {
    if (this.isRecording) {
      console.warn(`Already recording ${this.recordingTrackId}`);
      return;
    }
    this.isRecording = true;
  }

  private stopRecording(): void {
    this.fileWriter.end();
    this.recordingTrackId = undefined;
    this.isRecording = false;
    this.totalChunks = 0;
  }

  async getAllRecordings(): Promise<RecordedFile[]> {
    const dataDir = Path.resolve(this.config.parentDir);
    const allFiles = await readdir(dataDir);
    return allFiles.map<RecordedFile>((i) => {
      return FilenameUtils.parseFilename(i);
    });
  }

  playback(filename: string): IFileReader {
    const fileInfo = FilenameUtils.parseFilename(filename);
    const reader = new FileReader(this.config);
    reader.open(fileInfo);
    return reader;
  }

  maybeWritePacket(buffer: Buffer<ArrayBufferLike>): void {
    const packet = new ForzaTelemetryApi(buffer.byteLength, buffer);
    if (!packet.isRaceOn || !this.isRecording || packet.trackId === 0) {
      return;
    }
    if (!this.recordingTrackId) {
      this.recordingTrackId = packet.trackId;
    }
    if (packet.trackId !== this.recordingTrackId) {
      this.stopRecording();
      this.startRecording();
      this.recordingTrackId = packet.trackId;
    }
    if (!this.fileWriter.isOpen) {
      const filename = FilenameUtils.getFilename(
        this.recordingTrackId,
        buffer.byteLength
      );
      console.log(`Create recording ${filename}`);
      this.fileWriter.open(
        Path.resolve(this.config.parentDir, filename)
      );
    }
    if (this.fileWriter.isOpen) {
      this.totalChunks++;
      this.fileWriter.append(buffer);
    }
  }
}