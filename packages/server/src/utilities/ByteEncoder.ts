import { TextEncoder, TextDecoder } from 'node:util';

/**
 * Utility class to encode JS strings to and from ArrayBuffer
 * objects to send to uWebSockets. 
 * 
 * {@see uWebSockets.RecognizedString} - It is recommended to pass
 * buffers into the framework as JS strings are less performant
 */
export class ByteEncoder {
  /**
   * Decode a buffer into a string
   * @param buffer Buffer to decode
   * @returns 
   */
  static decode(buffer: ArrayBuffer): string {
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(buffer);
  }

  /**
   * Encode a string to a buffer
   * @param jsString String to encode
   * @returns 
   */
  static encode(jsString: string): Uint8Array {
    return (new TextEncoder()).encode(jsString);
  }
}