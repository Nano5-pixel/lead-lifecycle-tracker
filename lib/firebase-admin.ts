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

  const saBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!saBase64) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_BASE64 not configured');
  }

  const sa = JSON.parse(Buffer.from(saBase64, 'base64').toString('utf8'));
  
  // Fix for OpenSSL 3.x: convert the key to PKCS#8 format explicitly
  const privateKey = createPrivateKey(sa.private_key).export({
    type: 'pkcs8',
    format: 'pem',
  });

  adminApp = initializeApp({
    credential: cert({
      projectId: sa.project_id,
      clientEmail: sa.client_email,
      privateKey: privateKey as string,
    }),
  });

  return adminApp;
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}
