import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

let adminApp: App | undefined;

function getAdminApp(): App {
  if (adminApp) return adminApp;
  
  if (getApps().length > 0) {
    adminApp = getApps()[0];
    return adminApp;
  }

  const saBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!saBase64) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_BASE64 not configured');
  }

  const sa = JSON.parse(Buffer.from(saBase64, 'base64').toString('utf8'));

  adminApp = initializeApp({
    credential: cert(sa),
  });

  // Force Firestore to use REST instead of gRPC
  const db = getFirestore(adminApp);
  db.settings({ preferRest: true });

  return adminApp;
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}
