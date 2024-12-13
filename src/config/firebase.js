/* eslint-disable no-undef */
import { initializeApp, } from 'firebase-admin/app';
import admin from 'firebase-admin';
import { getMessaging } from 'firebase-admin/messaging';

const serviceAccount = process.env.FIREBASE_KEY_FILE;

const app = initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FCM_PROJECT_ID,
    clientEmail: process.env.FCM_CLIENT_EMAIL,
    privateKey: (`${process.env.FCM_PRIVATE_KEY}`).replace(/\\n/g, '\n'),
  }),
  projectId: process.env.GC_PROJECT_ID,
});

const messaging = getMessaging(app);

export { messaging };
