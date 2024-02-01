import { UserRecord } from "firebase-admin/auth";
import { Trabajador } from "@prisma/client";

type UserRecordWithoutToJSON = Omit<UserRecord, "toJSON">;

export interface TrabajadorCompleto
  extends Trabajador,
    UserRecordWithoutToJSON {
  displayName: string;
}
