import { NextRequest, NextResponse } from 'next/server';

const FIREBASE_PROJECT = 'lead-lifecycle-tracker-bba96';
const FIRESTORE_URL = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents`;

async function getAccessToken(): Promise<string> {
  const saBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!saBase64) throw new Error('No service account configured');
  const sa = JSON.parse(Buffer.from(saBase64, 'base64').toString('utf8'));
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/identitytoolkit https://www.googleapis.com/auth/datastore',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  })).toString('base64url');
  const { createSign } = await import('crypto');
  const sign = createSign('RSA-SHA256');
  sign.update(`${header}.${payload}`);
  const signature = sign.sign(sa.private_key, 'base64url');
  const jwt = `${header}.${payload}.${signature}`;
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) throw new Error('Failed to get access token');
  return tokenData.access_token;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { uid } = body;

    if (!uid) {
      return NextResponse.json({ error: 'Falta uid' }, { status: 400 });
    }

    const token = await getAccessToken();

    await fetch(
      `https://identitytoolkit.googleapis.com/v1/projects/${FIREBASE_PROJECT}/accounts:delete`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ localId: uid }),
      }
    );

    await fetch(`${FIRESTORE_URL}/usuarios/${uid}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    return NextResponse.json({ success: true, message: `Usuario eliminado` });
  } catch (err: unknown) {
    console.error('[API] Error eliminando usuario:', err);
    return NextResponse.json({ error: 'Error interno', details: String(err) }, { status: 500 });
  }
}
