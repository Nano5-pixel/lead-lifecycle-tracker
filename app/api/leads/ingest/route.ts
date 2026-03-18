import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  console.log('BASE64 exists:', !!process.env.FIREBASE_ADMIN_PRIVATE_KEY_BASE64);
  console.log('BASE64 length:', process.env.FIREBASE_ADMIN_PRIVATE_KEY_BASE64?.length);
  console.log('PRIVATE_KEY exists:', !!process.env.FIREBASE_ADMIN_PRIVATE_KEY);
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

    const adminDb = getAdminDb();

    const agenciasRef = adminDb.collection('agencias');
    const agenciaQuery = await agenciasRef.where('apiKey', '==', body.apiKey).limit(1).get();

    if (agenciaQuery.empty) {
      return NextResponse.json({ error: 'apiKey inválida' }, { status: 401 });
    }

    const agenciaDoc = agenciaQuery.docs[0];
    const agenciaData = agenciaDoc.data();

    if (agenciaData.estadoLicencia === 'inactivo') {
      return NextResponse.json({ error: 'Licencia inactiva' }, { status: 403 });
    }

    const clienteRef = agenciaDoc.ref.collection('clientes').doc(body.clienteId);
    const clienteDoc = await clienteRef.get();

    if (!clienteDoc.exists) {
      return NextResponse.json({ error: 'clienteId no encontrado' }, { status: 404 });
    }

    const now = new Date().toISOString();
    const leadData = {
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

    const leadRef = await clienteRef.collection('leads').add(leadData);

    return NextResponse.json({
      success: true,
      leadId: leadRef.id,
      message: `Lead creado exitosamente`,
    });
  } catch (err: unknown) {
    console.error('[API] Error en ingesta:', err);
    return NextResponse.json({ error: 'Error interno', details: String(err) }, { status: 500 });
  }
}
