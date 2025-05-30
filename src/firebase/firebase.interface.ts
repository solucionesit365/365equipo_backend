import { App } from "firebase-admin/app";
import {
  Auth,
  DecodedIdToken,
  UpdateRequest,
  UserRecord,
} from "firebase-admin/auth";

export abstract class IFirebaseService {
  abstract verifyToken(token: string): Promise<DecodedIdToken>;
  abstract getUidByEmail(email: string): Promise<string>;
  abstract generateCustomToken(uid: string): Promise<string>;
  abstract getUserWithToken(token: string): Promise<UserRecord>;
  abstract getUserByUid(uid: string): Promise<UserRecord>;
  abstract updateFirebaseUser(userData: UpdateRequest): Promise<void>;
  abstract getAuth(): Auth;
  abstract getApp(): App;
}
