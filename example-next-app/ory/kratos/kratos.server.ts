import { Configuration, FrontendApi } from '@ory/client';
import 'server-only';

const kratosServerBaseUrl = process.env.KRATOS_PUBLIC_BASE_URL;

if (!kratosServerBaseUrl) {
  throw new Error('KRATOS_PUBLIC_BASE_URL environment variable is not set');
}

console.log('[kratosServer] Initializing with base URL:', kratosServerBaseUrl);

export const kratosServer = new FrontendApi(
  new Configuration({
    basePath: kratosServerBaseUrl,
    baseOptions: { withCredentials: true },
  })
);
