import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, SESSION_COOKIE_NAME } from '../../../../lib/admin-auth';

function isAllowedRoute(method: string, pathSegments: string[]): boolean {
  const path = pathSegments.join('/');

  if (method === 'GET' && path === 'dashboard') return true;
  if (method === 'GET' && path === 'participants') return true;
  if (method === 'GET' && path === 'responses') return true;
  if (method === 'GET' && path === 'campaign') return true;
  if (method === 'PATCH' && path === 'campaign') return true;
  if (method === 'GET' && path === 'coupons') return true;
  if (method === 'POST' && path === 'coupons/import') return true;
  if (method === 'GET' && path === 'deliveries') return true;
  if (method === 'POST' && /^deliveries\/[^/]+\/resend$/.test(path)) return true;
  if (method === 'GET' && path === 'history') return true;

  return false;
}

async function handleProxy(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!verifySessionToken(token)) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const { path } = await params;
  const method = request.method;

  if (!isAllowedRoute(method, path)) {
    return NextResponse.json({ error: 'Rota não permitida.' }, { status: 403 });
  }

  const adminApiUrl = process.env.ADMIN_API_URL;
  const adminApiToken = process.env.ADMIN_API_TOKEN;

  if (!adminApiUrl || !adminApiToken) {
    return NextResponse.json(
      { error: 'Configuração da API administrativa ausente no servidor.' },
      { status: 500 }
    );
  }

  const baseUrl = adminApiUrl.replace(/\/$/, '');
  const pathString = path.join('/');
  const search = request.nextUrl.search;
  const targetUrl = `${baseUrl}/${pathString}${search}`;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${adminApiToken}`,
  };

  let body: string | undefined = undefined;
  if (method === 'POST' || method === 'PATCH' || method === 'PUT') {
    headers['Content-Type'] = 'application/json';
    try {
      body = await request.text();
    } catch {
      body = undefined;
    }
  }

  try {
    const backendRes = await fetch(targetUrl, {
      method,
      headers,
      body: body || undefined,
      cache: 'no-store',
    });

    const status = backendRes.status;

    if (status === 401 || status === 403) {
      return NextResponse.json({ error: 'Falha na autenticação com a API administrativa.' }, { status });
    }
    if (status === 429) {
      return NextResponse.json({ error: 'Limite de requisições excedido. Tente novamente em um minuto.' }, { status: 429 });
    }

    const data = await backendRes.json().catch(() => ({}));
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'Serviço administrativo indisponível no momento.' }, { status: 503 });
  }
}

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context);
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context);
}
