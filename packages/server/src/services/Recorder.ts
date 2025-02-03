import FS, { appendFile } from 'fs-extra';
const { existsSync, mkdirp, readdir } = FS;
import { ISubscribeUdpEvents, UdpEventSubscription } from "../types/ForzaUdpTypes.js";
import { IRecordDataConfig } from "../types/ServerConfig.js";
import * as Path from 'path';
import { Filename, IFilename, IForzaFile } from './Filename.js';
import { FileWriter, IFileWriter } from './FileWriter.js';
import { FileReader, IFileReader } from './FileReader.js';

export interface IRecordData {
  initialize(): Promise<void>;
  startRecording(trackId: string): void;
  stopRecording(): void;
  getAllRecordings(): Promise<IForzaFile[]>;
  playback(filename: string): IFileReader;
}

export class ForzaDataRecorder implements IRecordData {
  private udp: ISubscribeUdpEvents;
  private config: IRecordDataConfig;
  private filenames: IFilename;
  private fileWriter: IFileWriter;
  private recordingTrackId?: string;
  private packetSub?: UdpEventSubscription;

  constructor(config: IRecordDataConfig, udp: ISubscribeUdpEvents) {
    this.udp = udp;
    this.config = config;
    this.filenames = new Filename();
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

  startRecording(trackId: string): void {
    if(this.recordingTrackId) {
      console.warn(`Already recording ${this.recordingTrackId}`);
      return;
    }
    this.recordingTrackId = trackId;
    this.packetSub = this.udp.on('packet', this.handlePacket.bind(this));
  }

  stopRecording(): void {
    this.packetSub?.remove();
    this.fileWriter.end();
    this.recordingTrackId = undefined;
    this.packetSub = undefined;
  }

  async getAllRecordings(): Promise<IForzaFile[]> {
    const dataDir = Path.resolve(this.config.parentDir);
    const allFiles = await readdir(dataDir);
    return allFiles.map<IForzaFile>((i) => {
      return this.filenames.parseFilename(i);
    });
  }

  playback(filename: string): IFileReader {
    const filepath = Path.resolve(this.config.parentDir, filename);
    const reader = new FileReader();
    reader.open(filepath);
    return reader;
  }

  private handlePacket(buffer: Buffer<ArrayBufferLike>) {
    if(this.recordingTrackId && !this.fileWriter.isOpen) {
      const filename = this.filenames.getFilename(
        this.recordingTrackId,
        buffer.byteLength
      );
      console.log(`Create recording ${filename}`);
      this.fileWriter.open(
        Path.resolve(this.config.parentDir, filename)
      );
    }
    this.fileWriter.append(buffer);
  }
}