export interface TLogger {
  name: string;
  action: string;
  extraData?: any;
}

export interface TLoggerCollection {
  name: string;
  datetime: Date;
  action: string;
  extraData?: any;
}
