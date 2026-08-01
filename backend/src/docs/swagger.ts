import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication) {
  if (process.env.SWAGGER_ENABLED === 'false') return;

  const config = new DocumentBuilder()
    .setTitle('CupomForm API')
    .setDescription('API para campanhas, emissão única de cupons e solicitação de envio por WhatsApp.')
    .setVersion('1.0.0')
    .addServer('http://localhost:3001/api', 'Ambiente local')
    .addApiKey(
      { type: 'apiKey', in: 'header', name: 'x-internal-secret', description: 'Segredo exclusivo do callback n8n.' },
      'internal-secret',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (_controllerKey, methodKey) => methodKey,
  });

  SwaggerModule.setup('docs', app, document, {
    useGlobalPrefix: true,
    jsonDocumentUrl: 'docs-json',
    yamlDocumentUrl: 'docs-yaml',
    swaggerOptions: { persistAuthorization: true, displayRequestDuration: true },
    customSiteTitle: 'CupomForm API Docs',
  });
}
