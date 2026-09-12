# Security Policy

We take the security of this project seriously and appreciate responsible reports from the community.

## Supported Versions

Security updates are currently provided for the following release lines:

| Version | Supported |
| ------- | :-------: |
| 5.1.x   | ✅ |
| 5.0.x   | ❌ |
| 4.0.x   | ✅ |
| < 4.0   | ❌ |

Users running an unsupported version should upgrade to a supported release before reporting an issue. Security fixes may require upgrading to the latest patch release within a supported release line.

## Reporting a Vulnerability

**Do not report security vulnerabilities through public GitHub issues, discussions, pull requests, or other public channels.**

Instead, please use one of the following private reporting methods:

1. Open the repository's **Security** tab and select **Report a vulnerability**.
2. If private vulnerability reporting is unavailable, email **security@example.com**.

> Replace `security@example.com` with the appropriate security contact before publishing this policy.

### Information to Include

Please provide as much of the following information as possible:

- A description of the vulnerability and its potential impact
- The affected versions, components, or configurations
- Steps required to reproduce the issue
- A minimal proof of concept, if available
- Any known mitigations or suggested fixes
- Whether the vulnerability has been disclosed elsewhere
- Your preferred name and contact information for acknowledgment

Please avoid accessing, modifying, or deleting data that does not belong to you.

## What to Expect

After receiving a report, maintainers will aim to:

- Acknowledge receipt within **3 business days**
- Provide an initial assessment within **7 business days**
- Send progress updates at least every **7 days** while the issue remains active
- Notify the reporter when the vulnerability is accepted, declined, or requires additional information

If a report is accepted, we will work to confirm the issue, determine its severity, develop a fix, and coordinate a release and disclosure timeline.

If a report is declined, we will explain the reason when possible. Reports may be declined when they cannot be reproduced, affect only unsupported versions, do not present a security risk, or concern an upstream dependency that should be reported directly to its maintainers.

Response and remediation times may vary depending on the complexity and severity of the issue.

## Coordinated Disclosure

Please allow maintainers a reasonable amount of time to investigate and address a confirmed vulnerability before making it public.

We will coordinate disclosure with the reporter whenever possible. Once a fix is available, we may publish a GitHub Security Advisory containing:

- A description of the vulnerability
- Affected and fixed versions
- Severity and impact information
- Upgrade or mitigation instructions
- Credit to the reporter, if desired

## Responsible Research

We will consider security research to be conducted in good faith when you:

- Avoid privacy violations, data destruction, and service disruption
- Test only against systems and data you are authorized to access
- Report vulnerabilities privately and promptly
- Do not exploit a vulnerability beyond what is necessary to demonstrate it
- Allow reasonable time for remediation before public disclosure
- Comply with applicable laws

This project does not offer a bug bounty unless explicitly stated elsewhere.
