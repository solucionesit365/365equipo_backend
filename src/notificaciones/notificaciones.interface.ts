import { ObjectId } from "mongodb";

export interface NotificacionDto {
  _id?: ObjectId;
  uid: string;
  token: string;
}
