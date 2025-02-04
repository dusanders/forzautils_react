
export interface PlaybackRequest {
  filename: string;
}

export interface SetRecordingRequest {
  record: boolean;
}

export class WebsocketRequestValidator {
  static isPlaybackRequest(body: PlaybackRequest | unknown): body is PlaybackRequest {
    const valid = body as PlaybackRequest;
    return Boolean(valid.filename);
  }
  static isSetRecordingRequest(body: SetRecordingRequest | unknown): body is SetRecordingRequest {
    const valid = body as SetRecordingRequest;
    return Boolean(valid.record !== undefined);
  }
}