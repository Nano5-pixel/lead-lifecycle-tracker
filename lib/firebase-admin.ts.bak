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

  try {
    const jsonString = Buffer.from(saBase64, 'base64').toString('utf8');
    const sa = JSON.parse(jsonString);
    
    // CRITICAL: Normalize private key. 
    // JSON.parse handles \n in the string, but if the key was double-escaped 
    // or stored as a literal string with backslashes, we must fix it.
    if (sa.private_key) {
      sa.private_key = sa.private_key.replace(/\\n/g, '\n');
    }

    adminApp = initializeApp({
      credential: cert(sa),
    });

    // Force Firestore to use REST instead of gRPC. 
    // This often bypasses gRPC-specific auth/metadata plugin errors.
    const db = getFirestore(adminApp);
    db.settings({ preferRest: true });

    return adminApp;
  } catch (error: any) {
    console.error('Firebase Admin initialization failed:', error);
    throw error;
  }
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}
