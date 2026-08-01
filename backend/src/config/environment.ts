type Environment = Record<string, unknown>;

function required(config: Environment, key: string): string {
  const value = String(config[key] ?? '').trim();
  if (!value) throw new Error(`Variável obrigatória ausente: ${key}`);
  return value;
}

function validHttpUrl(value: string, key: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`Variável ${key} deve ser uma URL válida.`);
  }
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error(`Variável ${key} deve usar http ou https.`);
  }
  return value;
}

export function validateEnvironment(config: Environment): Environment {
  required(config, 'DATABASE_URL');

  const port = Number(config.PORT ?? 3001);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error('Variável PORT deve ser uma porta válida.');
  }

  const frontendUrls = String(config.FRONTEND_URL ?? 'http://localhost:3000')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  if (frontendUrls.length === 0) throw new Error('Variável FRONTEND_URL não pode ser vazia.');
  frontendUrls.forEach((value) => validHttpUrl(value, 'FRONTEND_URL'));

  if (config.NODE_ENV === 'production') {
    const adminToken = required(config, 'ADMIN_API_TOKEN');
    validHttpUrl(required(config, 'N8N_DELIVERY_WEBHOOK_URL'), 'N8N_DELIVERY_WEBHOOK_URL');
    const webhookSecret = required(config, 'N8N_SHARED_SECRET');
    const callbackSecret = required(config, 'INTERNAL_CALLBACK_SECRET');
    if (webhookSecret.length < 32 || callbackSecret.length < 32) {
      throw new Error('Segredos de integração devem ter pelo menos 32 caracteres.');
    }
    if (webhookSecret === callbackSecret) {
      throw new Error('N8N_SHARED_SECRET e INTERNAL_CALLBACK_SECRET devem ser diferentes.');
    }
    if (adminToken.length < 32) throw new Error('ADMIN_API_TOKEN deve ter pelo menos 32 caracteres.');
  }

  return { ...config, PORT: port, FRONTEND_URL: frontendUrls.join(',') };
}
