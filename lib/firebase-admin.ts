import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { createPrivateKey } from 'crypto';

let adminApp: App | undefined;

function getAdminApp(): App {
  if (adminApp) return adminApp;
  
  if (getApps().length > 0) {
    adminApp = getApps()[0];
    return adminApp;
  }

  // Try FIREBASE_SERVICE_ACCOUNT_BASE64 first (full JSON in base64)
  const saBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (saBase64) {
    const sa = JSON.parse(Buffer.from(saBase64, 'base64').toString('utf8'));
    adminApp = initializeApp({
      credential: cert(sa),
    });
    return adminApp;
  }

  // Fallback to individual env vars
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Firebase Admin credentials not configured');
  }

  privateKey = privateKey.replace(/\\n/g, '\n');

  adminApp = initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });

  return adminApp;
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}
