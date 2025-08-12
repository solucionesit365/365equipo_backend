export abstract class IGetDevicesUseCase {
  abstract execute(): Promise<DeviceResponse>;
}

interface Timestamp {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
}

interface Terminal {
  name: string;
  connectedDevices: number;
  code: number;
  delayMinutes: number;
  lastIP: string | null;
  machineAndLocalIP: string | null;
  tcod: string;
  releaseTimestamp: Timestamp | null;
  activationTimestamp: Timestamp | null;
  lastConnection: Timestamp | null;
}

interface Device {
  deviceModel: string;
  manufacturerCode: string;
  softwareVersion: string;
  connectedToTCOD: string;
  status: string;
  hardware: string;
  serialNumber: number;
  statusText: string;
}

export interface Branch {
  addressLine2: string;
  postCode: string;
  addressLine1: string;
  id: number;
  customerID: number | null;
  city: string;
  isVending: boolean;
  terminals: Terminal[];
  devices: Device[];
  manualClose: boolean;
  name: string;
}

export interface DeviceResponse {
  addressLine2: string;
  postCode: string;
  city: string;
  id: number;
  addressLine1: string;
  branches: Branch[];
}
