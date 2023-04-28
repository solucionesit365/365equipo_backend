import { initializeApp } from "firebase-admin/app";

if (process.env.NODE_ENV === "development") {
  process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";
}

export const app = initializeApp();
