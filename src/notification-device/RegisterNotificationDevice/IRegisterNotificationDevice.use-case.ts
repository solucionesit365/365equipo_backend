export abstract class IRegisterNotificationDeviceUseCase {
  abstract execute(uid: string, deviceToken: string): Promise<void>;
}
