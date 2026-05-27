# Security Policy

## Overview

Budget Tracker is a personal finance application designed for self-hosted deployment. Security is important to us, and we take it seriously.

## Supported Versions

| Version | Status | Security Updates |
|---------|--------|------------------|
| 1.x     | Active | Yes              |
| 0.x     | Legacy | No               |

## Security Considerations

### Architecture

Budget Tracker runs on your own infrastructure (home server, VPS, cloud provider). This means:

- **No cloud vendor involvement** — your data stays on servers you control
- **Network isolation** — data is not transmitted to third-party services
- **Full visibility** — you can audit code and deployment
- **Responsibility** — you manage network security and updates

### Current Limitations

Budget Tracker is a learning project and **not yet suitable for production use** in high-security environments. Known gaps:

- [ ] Input validation is basic (not comprehensive)
- [ ] No rate limiting on API endpoints
- [ ] No API key/authentication system (assumes private network)
- [ ] No encryption at rest for database
- [ ] No SQL injection protections beyond ORM defaults
- [ ] No CSRF protections implemented
- [ ] Minimal error handling for edge cases

See [Issues](https://github.com/MenokoOG/budget-tracker-fullstack/issues) for the full backlog.

## Deployment Security

### Prerequisites

Before deploying to any network, ensure:

1. **Network Isolation:**
   - Only expose to trusted networks (local LAN, VPN)
   - Do NOT expose to the public internet without additional security
   - Use firewall rules to restrict access

2. **Database Security:**
   - Use strong PostgreSQL password (change from default `budget`)
   - Store credentials in `.env.docker` (never commit to git)
   - Use named volumes for persistent storage
   - Regular backups of PostgreSQL data

3. **Container Security:**
   - Run Docker daemon with minimal privileges
   - Keep Docker and Node.js versions up to date
   - Monitor container logs for errors
   - Use `read-only` mount points where possible

4. **Server Security:**
   - Keep your OS and packages updated
   - Use SSH key authentication (not passwords)
   - Disable unnecessary services
   - Use a firewall (iptables, firewalld, etc.)

### Home Server Deployment

If deploying on a home server:

- **CasaOS/Dockpeek:** Keep the management interface behind strong authentication
- **Network access:** Only enable port forwarding if absolutely necessary
- **VPN option:** Use Tailscale or Wireguard for secure remote access
- **HTTPS:** If exposing via reverse proxy, use proper SSL/TLS certificates

### Cloud Deployment

If deploying to Render, Railway, or similar:

- Set `CORS_ORIGIN` to match your domain exactly
- Use environment variables for all secrets (never hardcode)
- Enable HTTPS (most platforms provide this by default)
- Review platform-specific security guidance
- Consider adding authentication/authorization layer before production use

## Reporting Security Issues

If you discover a security vulnerability:

1. **Do NOT open a public GitHub issue**
2. **Email details to:** jefftkddan@gmail.com with subject `[SECURITY] Budget Tracker Vulnerability`
3. **Include:**
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if you have one)

4. **We will:**
   - Acknowledge receipt within 48 hours
   - Investigate the issue
   - Develop and test a fix
   - Release a patched version
   - Credit you in release notes (if desired)

## Data Privacy

Budget Tracker stores financial data locally. Keep this in mind:

- **No telemetry:** The app does not collect or transmit usage data
- **No tracking:** No analytics, marketing pixels, or third-party scripts
- **Data ownership:** All your data is yours and stays on your servers
- **Backups:** Your responsibility to back up the PostgreSQL database

## Secure Practices for Contributors

If you're working on Budget Tracker:

1. **Never commit secrets** (passwords, API keys, private data)
2. **Use `.env.example`** to show required variables (without values)
3. **Test locally first** before opening PRs
4. **Review dependencies** for known vulnerabilities (`npm audit`)
5. **Keep dependencies updated** (use `npm update` regularly)

## Dependency Management

Monitor third-party package vulnerabilities:

```bash
npm audit          # Check for known issues
npm audit fix      # Auto-fix if possible
npm update         # Update to latest compatible versions
```

Check the package.json regularly and update dependencies:

```json
{
  "dependencies": {
    "react": "^18.x",
    "express": "^4.x",
    "pg": "^8.x"
  }
}
```

### Critical Dependencies

- **React:** Frontend UI framework
- **Express.js:** API server
- **PostgreSQL driver:** Database connection
- **Vite:** Build tool

Keep these updated. Breaking changes are rare but do happen.

## Testing & Verification

Before deploying changes:

1. **Test locally** — verify app works in development
2. **Test in Docker** — verify deployment works
3. **Manual testing** — create/edit/delete transactions
4. **Check logs** — look for errors in Docker compose logs

## Known Attack Vectors (Not Yet Mitigated)

These are known risks we haven't addressed yet. If using Budget Tracker, be aware:

1. **SQL Injection** — possible if input validation is incomplete
2. **CSRF** — forms lack CSRF tokens
3. **XSS** — malicious input could run in browser (React helps, but not bulletproof)
4. **Unencrypted transport** — if not behind HTTPS
5. **Weak authentication** — currently assumes private network

## Roadmap

Security improvements planned:

- [ ] Add input validation and sanitization
- [ ] Implement rate limiting
- [ ] Add optional API authentication (JWT or similar)
- [ ] Encrypt sensitive fields in database
- [ ] Add CSRF protections
- [ ] Implement SQL injection protections
- [ ] Add security headers (CSP, etc.)
- [ ] Regular security audits

## Resources

Learn more about securing web applications:

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/sql-syntax.html#SQL-SYNTAX-IDENTIFIERS)
- [Docker Security](https://docs.docker.com/engine/security/)

## Questions?

If you have security questions:

1. Check existing GitHub issues
2. Open a Discussion (not an issue) for security questions
3. Email for potential vulnerabilities (see "Reporting" above)

## License

This Security Policy is part of Budget Tracker and is released under MIT license.

---

**Last Updated:** 2026-05-27
