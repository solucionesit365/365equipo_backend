import * as firestore from "firebase-admin/firestore";
import { app } from "./app.js";

export const db = firestore.getFirestore(app);
