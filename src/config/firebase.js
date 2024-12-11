import { application } from 'express';
import { applicationDefault, initializeApp, } from 'firebase-admin/app';
import admin from 'firebase-admin';
import { getMessaging } from 'firebase-admin/messaging';

const serviceAccount = process.env.FIREBASE_KEY_FILE;

const app = initializeApp({
  credential: admin.credential.cert(serviceAccount), // myRefreshToken
  projectId: process.env.GC_PROJECT_ID,
});

const messaging = getMessaging(app);

export { messaging };
