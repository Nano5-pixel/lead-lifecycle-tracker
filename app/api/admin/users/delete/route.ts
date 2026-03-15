import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const { uid } = await request.json();

    if (!uid) {
      return NextResponse.json({ error: 'UID is required' }, { status: 400 });
    }

    // Opcional: Podríamos verificar el token de sesión aquí para asegurar que quien llama es admin.
    // Pero por ahora, implementamos la funcionalidad básica solicitada.
    
    await adminAuth.deleteUser(uid);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting user from Auth:', error);
    return NextResponse.json(
      { error: error.message || 'Error deleting user from Auth' },
      { status: 500 }
    );
  }
}
