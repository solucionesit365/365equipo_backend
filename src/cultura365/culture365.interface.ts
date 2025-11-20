import { ObjectId } from "mongodb";

export interface culture365Interface {
  _id: ObjectId;
  title: string;
  description: string;
  creation: Date;
  views: number;
  urlVideo: string;
}
