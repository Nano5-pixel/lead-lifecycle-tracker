import { NextRequest, NextResponse } from 'next/server';

// Direct Firestore REST API - bypasses firebase-admin SDK entirely
const FIREBASE_PROJECT = 'lead-lifecycle-tracker-bba96';
const FIRESTORE_URL = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents`;

async function getAccessToken(): Promise<string> {
  const saBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!saBase64) throw new Error('No service account configured');
  
  const sa = JSON.parse(Buffer.from(saBase64, 'base64').toString('utf8'));
  
  // Create JWT manually
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/datastore',
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
  return tokenData.access_token;
}

async function firestoreGet(path: string, token: string) {
  const res = await fetch(`${FIRESTORE_URL}/${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return res.json();
}

async function firestoreQuery(collectionPath: string, field: string, value: string, token: string) {
  const parts = collectionPath.split('/');
  const parent = parts.length > 1 
    ? `${FIRESTORE_URL}/${parts.slice(0, -1).join('/')}`
    : `${FIRESTORE_URL}`;
  const collectionId = parts[parts.length - 1];
  
  const res = await fetch(`${parent}:runQuery`, {
    method: 'POST',
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId }],
        where: {
          fieldFilter: {
            field: { fieldPath: field },
            op: 'EQUAL',
            value: { stringValue: value },
          },
        },
        limit: 1,
      },
    }),
  });
  
  const data = await res.json();
  if (!data[0]?.document) return null;
  return data[0].document;
}

async function firestoreCreate(collectionPath: string, fields: Record<string, any>, token: string) {
  const res = await fetch(`${FIRESTORE_URL}/${collectionPath}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fields: Object.fromEntries(
        Object.entries(fields).map(([k, v]) => {
          if (typeof v === 'boolean') return [k, { booleanValue: v }];
          if (typeof v === 'number') return [k, { integerValue: String(v) }];
          return [k, { stringValue: String(v) }];
        })
      ),
    }),
  });
  
  return res.json();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.apiKey) {
      return NextResponse.json({ error: 'Falta apiKey' }, { status: 400 });
    }
    if (!body.clienteId) {
      return NextResponse.json({ error: 'Falta clienteId' }, { status: 400 });
    }
    if (!body.nombre && !body.telefono) {
      return NextResponse.json({ error: 'Se requiere al menos nombre o telefono' }, { status: 400 });
    }

    const token = await getAccessToken();

    // Find agencia by apiKey
    const agenciaDoc = await firestoreQuery('agencias', 'apiKey', body.apiKey, token);
    if (!agenciaDoc) {
      return NextResponse.json({ error: 'apiKey inválida' }, { status: 401 });
    }

    // Check license
    const agenciaName = agenciaDoc.name;
    const agenciaFields = agenciaDoc.fields;
    if (agenciaFields?.estadoLicencia?.stringValue === 'inactivo') {
      return NextResponse.json({ error: 'Licencia inactiva' }, { status: 403 });
    }

    // Extract agenciaId from document path
    const agenciaId = agenciaName.split('/').pop();

    // Check cliente exists
    const clientePath = `agencias/${agenciaId}/clientes/${body.clienteId}`;
    const clienteDoc = await firestoreGet(clientePath, token);
    if (!clienteDoc) {
      return NextResponse.json({ error: 'clienteId no encontrado' }, { status: 404 });
    }

    // Create lead
    const now = new Date().toISOString();
    const leadFields = {
      nombre: body.nombre || '',
      telefono: body.telefono || '',
      email: body.email || '',
      fuente: body.fuente || 'Facebook Ads',
      etapa: 'Nuevo',
      preCalificado: false,
      contratoFirmado: false,
      motivoCaida: '',
      notas: body.notas || '',
      fechaEntrada: now,
      fechaUltimoCambio: now,
      diasEnEtapa: 0,
      gestionadoPor: body.gestionadoPor || '',
    };

    const leadsPath = `agencias/${agenciaId}/clientes/${body.clienteId}/leads`;
    const result = await firestoreCreate(leadsPath, leadFields, token);

    const leadId = result.name?.split('/').pop() || 'unknown';

    return NextResponse.json({
      success: true,
      leadId,
      message: `Lead creado exitosamente`,
    });
  } catch (err: unknown) {
    console.error('[API] Error en ingesta:', err);
    return NextResponse.json(
      { error: 'Error interno', details: String(err) },
      { status: 500 }
    );
  }
}
