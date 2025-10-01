import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { verifySession } from '@/lib/auth';

// Aca busco documentos por titulo, del usuario autenticado
export async function GET(req) {
  const token = req.cookies.get('session')?.value || '';
  const session = await verifySession(token);
  if (!session) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

  // Aca obtengo el parametro q de la query string
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();

  const db = getDB();
  // Parametrizado (sin SQLi) y case-insensitive
  const rows = db.prepare(
    `SELECT id, title, description, created_at
     FROM documents
     WHERE user_id = ? AND title LIKE ? COLLATE NOCASE
     ORDER BY id ASC`
  ).all(session.uid, `%${q}%`);

  return NextResponse.json(rows);
}
