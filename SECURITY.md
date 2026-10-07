# Security Policy

## Reporting a Vulnerability

Report security issues **privately** to the maintainers — do not open a public
issue for an unfixed vulnerability.

## Scope

This platform handles citizen feedback and end-to-end encrypted whistleblower
reports. Please report anything that could expose submitter identity, report
ciphertext, admin sessions, or rate-limit bypasses.

## Handling of secrets

- `ADMIN_PASSWORD_HASH` and `JWT_SECRET` are **required in every environment**.
  The application will refuse admin authentication without them.
- Generate a unique password hash per deployment:
  ```bash
  node -e "console.log(require('bcryptjs').hashSync('your-strong-password', 12))"
  openssl rand -hex 32   # for JWT_SECRET
  ```
- Never commit `.env`, database files (`*.db`), private keys, or real password
  hashes to the repository.
- The whistleblower private key must never be placed on the server. The server
  holds `WHISTLEBLOWER_PUBLIC_KEY` only. Decrypt offline with
  `scripts/whistleblower_decrypt.mjs`.

## Auth model

- Admin sessions use JWT (HS256) in an HttpOnly, SameSite=Lax cookie (Secure in
  production). Session lifetime: 8 hours.
- Login is rate-limited per IP (5 attempts / 15 minutes by default).
- On serverless, configure `RATE_LIMIT_KV_URL` + `RATE_LIMIT_KV_TOKEN` (Upstash)
  so limits are shared across instances.

## Checklist before production deploy

- [ ] Unique `ADMIN_PASSWORD_HASH` (not shared across environments)
- [ ] Unique `JWT_SECRET` (≥ 32 characters)
- [ ] `NEXT_PUBLIC_BASE_URL` matches the public domain
- [ ] Whistleblower keys generated offline; only public key on server
- [ ] No `*.db` or secrets in the git tree
- [ ] `TRUST_PROXY=1` when behind Vercel / Caddy / nginx
