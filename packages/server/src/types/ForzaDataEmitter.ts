export interface IForzaDataEmitter {
  sendPacket(bytes: ArrayBuffer): void;
}