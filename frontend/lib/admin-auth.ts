import crypto from 'crypto';

export const SESSION_COOKIE_NAME = 'admin_session';

export function getSessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || '';
}

export function getAdminPassword(): string {
  return process.env.ADMIN_PANEL_PASSWORD || '';
}

export function signSessionToken(): string {
  const secret = getSessionSecret();
  if (!secret) {
    throw new Error('ADMIN_SESSION_SECRET não está configurado.');
  }

  const payload = JSON.stringify({
    exp: Date.now() + 8 * 60 * 60 * 1000, // 8 horas de validade
  });
  const encodedPayload = Buffer.from(payload).toString('base64url');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(encodedPayload)
    .digest('base64url');

  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token || typeof token !== 'string') return false;
  const secret = getSessionSecret();
  if (!secret) return false;

  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [encodedPayload, signature] = parts;

  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(encodedPayload)
      .digest('base64url');

    const sigBuffer = Buffer.from(signature);
    const expectedSigBuffer = Buffer.from(expectedSignature);

    if (sigBuffer.length !== expectedSigBuffer.length) {
      return false;
    }

    if (!crypto.timingSafeEqual(sigBuffer, expectedSigBuffer)) {
      return false;
    }

    const payloadJson = Buffer.from(encodedPayload, 'base64url').toString('utf-8');
    const payload = JSON.parse(payloadJson);

    if (typeof payload.exp !== 'number' || payload.exp < Date.now()) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export function checkPassword(password: string): boolean {
  const expectedPassword = getAdminPassword();
  if (!expectedPassword || !password) return false;

  try {
    const passBuf = Buffer.from(password);
    const expectedBuf = Buffer.from(expectedPassword);
    if (passBuf.length !== expectedBuf.length) {
      return false;
    }
    return crypto.timingSafeEqual(passBuf, expectedBuf);
  } catch {
    return false;
  }
}
