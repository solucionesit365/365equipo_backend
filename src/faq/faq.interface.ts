import { ObjectId } from "mongodb";

export interface FaqInterface {
  _id?: ObjectId;
  question: string;
  answer: string;
}
