import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

// ==============================================
// POST /api/leads/ingest
// Make.com envía leads nuevos a esta URL
// ==============================================
// Body esperado:
// {
//   "apiKey": "llt_xxxxx",        ← identifica a la agencia
//   "clienteId": "abc123",        ← identifica al cliente dentro de la agencia
//   "nombre": "María González",
//   "telefono": "+52 555 100 2001",
//   "email": "maria@email.com",   ← opcional
//   "fuente": "Facebook Ads",     ← opcional
//   "notas": "",                   ← opcional
//   "gestionadoPor": ""            ← opcional
// }

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validar campos requeridos
    if (!body.apiKey) {
      return NextResponse.json(
        { error: 'Falta apiKey' },
        { status: 400 }
      );
    }
    if (!body.clienteId) {
      return NextResponse.json(
        { error: 'Falta clienteId' },
        { status: 400 }
      );
    }
    if (!body.nombre && !body.telefono) {
      return NextResponse.json(
        { error: 'Se requiere al menos nombre o telefono' },
        { status: 400 }
      );
    }

    // Buscar agencia por apiKey
    const agenciasRef = adminDb.collection('agencias');
    const agenciaQuery = await agenciasRef
      .where('apiKey', '==', body.apiKey)
      .limit(1)
      .get();

    if (agenciaQuery.empty) {
      return NextResponse.json(
        { error: 'apiKey inválida — agencia no encontrada' },
        { status: 401 }
      );
    }

    const agenciaDoc = agenciaQuery.docs[0];
    const agenciaData = agenciaDoc.data();

    // Verificar licencia activa (RULE-10)
    if (agenciaData.estadoLicencia === 'inactivo') {
      return NextResponse.json(
        { error: 'Licencia inactiva — servicio suspendido' },
        { status: 403 }
      );
    }

    // Verificar que el cliente existe dentro de la agencia
    const clienteRef = agenciaDoc.ref
      .collection('clientes')
      .doc(body.clienteId);
    const clienteDoc = await clienteRef.get();

    if (!clienteDoc.exists) {
      return NextResponse.json(
        { error: 'clienteId no encontrado en esta agencia' },
        { status: 404 }
      );
    }

    // Crear el lead
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
      message: `Lead "${body.nombre}" creado en ${clienteDoc.data()?.nombre || body.clienteId}`,
    });
  } catch (err: unknown) {
    console.error('[API] Error en ingesta:', err);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: String(err) },
      { status: 500 }
    );
  }
}
