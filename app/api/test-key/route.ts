import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    if (!b64) return NextResponse.json({ error: 'No base64 var found' });
    
    const json = Buffer.from(b64, 'base64').toString('utf8');
    const parsed = JSON.parse(json);
    
    return NextResponse.json({
      hasPrivateKey: !!parsed.private_key,
      keyStart: parsed.private_key?.substring(0, 30),
      keyEnd: parsed.private_key?.substring(parsed.private_key.length - 30),
      projectId: parsed.project_id,
      clientEmail: parsed.client_email?.substring(0, 20) + '...',
      nodeVersion: process.version,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
