import { Configuration, FrontendApi } from "@ory/client"

export const kratos = new FrontendApi(
  new Configuration({
    basePath: process.env.NEXT_PUBLIC_KRATOS_PUBLIC_URL,
    baseOptions: { withCredentials: true },
  })
)

