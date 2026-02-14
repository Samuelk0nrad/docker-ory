import { kratos } from "@/ory/kratos/kratos";
import { cookies } from "next/headers";
import { redirect, unstable_rethrow } from "next/navigation";

interface ConsentPageProps {
  searchParams: Promise<{
    consent_challenge?: string;
  }>;
}

/**
 * Hydra Consent Page
 *
 * Auto-accepts the OAuth2 consent request with:
 * - All requested scopes
 * - All requested audiences
 * - User identity traits embedded in JWT session claims (id_token + access_token)
 *
 * Since the OAuth client is configured with `skip_consent: true`, Hydra will
 * typically set `skip: true` on the consent request, but we still need this
 * endpoint to formally accept and embed user claims.
 */
export default async function HydraConsentPage({
  searchParams,
}: ConsentPageProps) {
  const { consent_challenge } = await searchParams;

  if (!consent_challenge) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">
            Missing consent_challenge
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            This page requires a valid consent_challenge parameter.
          </p>
        </div>
      </div>
    );
  }

  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    // 1. Fetch the consent request from Hydra
    const consentReqUrl = new URL(`${baseUrl}/api/hydra/consent`);
    consentReqUrl.searchParams.set("consent_challenge", consent_challenge);

    const consentReqRes = await fetch(consentReqUrl.toString());
    if (!consentReqRes.ok) {
      throw new Error(
        `Failed to fetch consent request: ${consentReqRes.statusText}`
      );
    }

    const consentRequest = await consentReqRes.json();

    // 2. Get the Kratos session to embed user traits
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");

    let userClaims = {};
    try {
      const { data: session } = await kratos.toSession({ cookie: cookieHeader });
      const identity = session.identity;

      // Extract common user traits for the JWT
      userClaims = {
        sub: identity?.id ?? consentRequest.subject,
        email: identity?.traits?.email ?? "",
        name: identity?.traits?.name ?? "",
        // Add any other traits you want in the JWT
      };
    } catch (err) {
      console.warn("[hydra/consent] No Kratos session found, using subject:", consentRequest.subject);
      // Fall back to just the subject if no Kratos session
      userClaims = {
        sub: consentRequest.subject,
      };
    }

    // 3. Accept consent with all requested scopes + audiences + user claims
    const acceptRes = await fetch(`${baseUrl}/api/hydra/consent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        consent_challenge,
        grant_scope: consentRequest.requested_scope ?? [],
        grant_access_token_audience:
          consentRequest.requested_access_token_audience ?? [],
        session: {
          id_token: userClaims,
          access_token: userClaims,
        },
      }),
    });

    if (!acceptRes.ok) {
      throw new Error(`Failed to accept consent: ${acceptRes.statusText}`);
    }

    const { redirect_to } = await acceptRes.json();
    redirect(redirect_to);
  } catch (error) {
    console.error("[hydra/consent page] error:", error);
    
    // Re-throw Next.js internal errors (like redirect) so they are handled by the framework
    unstable_rethrow(error);
        
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">
            Consent Flow Error
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {error instanceof Error ? error.message : "An error occurred"}
          </p>
        </div>
      </div>
    );
  }
}
