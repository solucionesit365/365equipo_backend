type DeviceStatus = "Conectado" | "Desconectado" | "Inestable" | "Leyendo";

interface DeviceTrack {
  status: DeviceStatus;
  lastNotified?: Date;
}

export class DisconnectedDevicesStore {
  private devices = new Map<string, DeviceTrack>();

  get(deviceId: string): DeviceTrack | undefined {
    return this.devices.get(deviceId);
  }

  set(deviceId: string, track: DeviceTrack) {
    this.devices.set(deviceId, track);
  }

  clear(deviceId: string) {
    this.devices.delete(deviceId);
  }
}

export const disconnectedDevicesStore = new DisconnectedDevicesStore();
