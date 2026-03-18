import { NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const { email, password, nombre, rol, agenciaId, clienteId } = await request.json();

    if (!email || !password || !nombre || !rol) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    // 1. Crear usuario en Firebase Auth
    const userRecord = await getAdminAuth().createUser({
      email,
      password,
      displayName: nombre,
    });

    // 2. Crear documento en Firestore
    await getAdminDb().collection('usuarios').doc(userRecord.uid).set({
      email,
      nombre,
      rol,
      agenciaId: agenciaId || '',
      clienteId: clienteId || '',
      creadoEn: new Date().toISOString(),
    });

    return NextResponse.json({ 
      success: true, 
      uid: userRecord.uid 
    });
  } catch (error: any) {
    console.error('Error creating user with Admin SDK:', error);
    
    // Manejar errores comunes
    if (error.code === 'auth/email-already-exists') {
      return NextResponse.json({ error: 'El email ya está en uso' }, { status: 400 });
    }

    return NextResponse.json(
      { error: error.message || 'Error al crear usuario' },
      { status: 500 }
    );
  }
}
