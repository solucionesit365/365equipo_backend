import { DecodedIdToken } from "firebase-admin/auth";

export abstract class IFirebaseService {
  abstract verifyToken(token: string): Promise<DecodedIdToken>;
  abstract getUidByEmail(email: string): Promise<string>;
}
