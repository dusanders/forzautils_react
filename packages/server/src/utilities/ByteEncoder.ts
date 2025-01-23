import { TextEncoder, TextDecoder } from 'node:util';

export class ByteEncoder {
  static decode(buffer: ArrayBuffer): string {
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(buffer);
  }
  static encode(jsString: string): ArrayBuffer {
    return (new TextEncoder()).encode(jsString);
  }
}