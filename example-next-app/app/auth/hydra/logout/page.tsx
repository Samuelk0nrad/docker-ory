import { kratos } from "@/ory/kratos/kratos";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface LogoutPageProps {
  searchParams: Promise<{
    logout_challenge?: string;
  }>;
}

/**
 * Hydra Logout Page
 *
 * Handles the OAuth2 logout flow by:
 * 1. Fetching the Hydra logout request
 * 2. Destroying the Kratos session (createBrowserLogoutFlow + updateLogoutFlow)
 * 3. Accepting the Hydra logout request
 * 4. Redirecting to the URL provided by Hydra
 */
export default async function HydraLogoutPage({
  searchParams,
}: LogoutPageProps) {
  const { logout_challenge } = await searchParams;

  if (!logout_challenge) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">
            Missing logout_challenge
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            This page requires a valid logout_challenge parameter.
          </p>
        </div>
      </div>
    );
  }

  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    // 1. Fetch the Hydra logout request
    const logoutReqUrl = new URL(`${baseUrl}/api/hydra/logout`);
    logoutReqUrl.searchParams.set("logout_challenge", logout_challenge);

    const logoutReqRes = await fetch(logoutReqUrl.toString());
    if (!logoutReqRes.ok) {
      throw new Error(
        `Failed to fetch logout request: ${logoutReqRes.statusText}`
      );
    }

    await logoutReqRes.json(); // Get the logout request (for logging/debugging if needed)

    // 2. Destroy the Kratos session
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");

    try {
      // Create a logout flow
      const { data: logoutFlow } = await kratos.createBrowserLogoutFlow({
        cookie: cookieHeader,
      });

      // Execute the logout (invalidates the Kratos session)
      if (logoutFlow.logout_token) {
        await kratos.updateLogoutFlow({
          token: logoutFlow.logout_token,
          cookie: cookieHeader,
        });
      }
    } catch (err) {
      console.warn("[hydra/logout] Failed to destroy Kratos session:", err);
      // Continue anyway — the Hydra logout should still proceed
    }

    // 3. Accept the Hydra logout request
    const acceptRes = await fetch(`${baseUrl}/api/hydra/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logout_challenge }),
    });

    if (!acceptRes.ok) {
      throw new Error(`Failed to accept logout: ${acceptRes.statusText}`);
    }

    const { redirect_to } = await acceptRes.json();

    // 4. Redirect to the Hydra-provided URL
    redirect(redirect_to);
  } catch (error) {
    console.error("[hydra/logout page] error:", error);
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">
            Logout Flow Error
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {error instanceof Error ? error.message : "An error occurred"}
          </p>
        </div>
      </div>
    );
  }
}
