import { NextResponse } from 'next/server';
import { checkPassword, signSessionToken, SESSION_COOKIE_NAME } from '../../../../lib/admin-auth';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { password } = body;

    if (!password || !checkPassword(password)) {
      return NextResponse.json({ error: 'Senha de administrador incorreta.' }, { status: 401 });
    }

    const token = signSessionToken();
    const response = NextResponse.json({ ok: true });

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 8 * 60 * 60, // 8 horas
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao realizar login.' },
      { status: 500 }
    );
  }
}
