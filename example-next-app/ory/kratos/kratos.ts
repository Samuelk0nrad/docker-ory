import { Configuration, FrontendApi } from '@ory/client';

export const KratosBaseUrl = process.env.NEXT_PUBLIC_KRATOS_PUBLIC_URL;

if (!KratosBaseUrl) {
  throw new Error(
    'NEXT_PUBLIC_KRATOS_PUBLIC_URL environment variable is not set'
  );
}

export const kratos = new FrontendApi(
  new Configuration({
    basePath: KratosBaseUrl,
    baseOptions: { withCredentials: true },
  })
);
