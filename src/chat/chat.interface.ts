import { ObjectId } from "mongodb";

export interface Chat {
  id?: ObjectId;
  content: string;
  senderId: number;
  sender: string;
  contactId: number;
  createdAt?: Date;
  read: boolean;
}
