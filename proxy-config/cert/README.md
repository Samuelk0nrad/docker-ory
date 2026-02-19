# TLS Certificates

This directory holds self-signed TLS certificates for the local development proxy.

## Generating certificates with mkcert

1. [Install mkcert](https://github.com/FiloSottile/mkcert#installation)
2. Install the local CA (first time only):
   ```bash
   mkcert -install
   ```
3. Generate the certificate for `auth.moorph.local`:

   ```bash
   cd proxy-config/cert
   mkcert auth.moorph.local
   ```

   This creates:
   - `auth.moorph.local.pem` — certificate
   - `auth.moorph.local-key.pem` — private key

4. Add `auth.moorph.local` to `/etc/hosts`:
   ```
   127.0.0.1  auth.moorph.local
   ```

> **Note:** These files are gitignored to avoid committing machine-specific or sensitive credentials. Each developer must generate their own certs.
