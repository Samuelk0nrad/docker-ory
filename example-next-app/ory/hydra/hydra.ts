import { Configuration, OAuth2Api } from "@ory/client";

/**
 * Hydra Admin API base URL — server-side only, never exposed to the browser.
 * Defaults to the Docker-internal Hydra admin port.
 */
const HydraAdminUrl =
  process.env.HYDRA_ADMIN_URL ?? "http://localhost:5445";

/**
 * Server-side Hydra Admin client.
 *
 * Used exclusively inside Next.js Route Handlers (app/api/…) to manage
 * OAuth2 login / consent / logout flows. No cookies/credentials are needed
 * because the admin API is an internal, trusted endpoint.
 */
export const hydraAdmin = new OAuth2Api(
  new Configuration({
    basePath: HydraAdminUrl,
  })
);
