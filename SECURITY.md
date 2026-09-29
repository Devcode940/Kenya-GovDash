# Security Policy

## Reporting a Vulnerability

Report security issues privately to the maintainers — do not open a public issue
for an unfixed vulnerability.

## Scope

This platform handles citizen feedback and end-to-end encrypted whistleblower
reports. Please report anything that could expose submitter identity, report
ciphertext, admin sessions, or rate-limit bypasses.

## Handling of secrets

- `ADMIN_PASSWORD_HASH` and `JWT_SECRET` are required in production; the app
  refuses to start without them.
- The whistleblower private key must never be placed on the server. The server
  holds `WHISTLEBLOWER_PUBLIC_KEY` only.
