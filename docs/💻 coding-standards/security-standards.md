# Security Standards

## Overview

This document defines security standards and practices for the AI Presentations project, with emphasis on preventing credential leaks, secure coding practices, and vulnerability management.

## Core Security Principles

1. **No Secrets in Code**: Never commit API keys, passwords, or sensitive data
2. **Defense in Depth**: Multiple layers of security controls
3. **Least Privilege**: Minimal permissions required for each operation
4. **Input Validation**: Validate and sanitize all external inputs
5. **Security by Default**: Secure configurations out of the box

## Secret Management

### Environment Variables

**Always use environment variables for sensitive data**:

**Good**:
```typescript
// .env (NEVER commit this file)
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
DATABASE_URL=postgresql://user:pass@localhost/db

// Usage in code
const apiKey = process.env.ANTHROPIC_API_KEY
if (!apiKey) {
  throw new Error('ANTHROPIC_API_KEY is required')
}
```

**Bad**:
```typescript
// ❌ NEVER do this
const apiKey = 'sk-ant-api03-xxxxx'  // Hardcoded secret!
```

### .env File Management

**Add to .gitignore**:
```gitignore
# .gitignore
.env
.env.local
.env.*.local
*.key
*.pem
secrets/
```

**Create .env.example**:
```bash
# .env.example (safe to commit)
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
DATABASE_URL=postgresql://user:pass@host/db
```

### Secret Scanning

#### Pre-commit Hook with detect-secrets

Install and configure:

```bash
# Install detect-secrets
pip install detect-secrets

# Initialize baseline
detect-secrets scan > .secrets.baseline

# Add to .pre-commit-config.yaml
repos:
  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.4.0
    hooks:
      - id: detect-secrets
        args: ['--baseline', '.secrets.baseline']
```

#### Gitleaks for Advanced Scanning

```bash
# Install gitleaks
brew install gitleaks

# Scan repository
gitleaks detect --source . --verbose

# Add to pre-commit
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.18.0
    hooks:
      - id: gitleaks
```

#### GitHub Secret Scanning

Enable in repository settings:
- Settings → Security → Code security and analysis
- Enable "Secret scanning"
- Enable "Push protection" to block commits with secrets

### Common Secret Patterns to Avoid

```typescript
// ❌ Bad patterns
const apiKey = 'sk-ant-api03-xxxxx'
const password = 'myP@ssw0rd123'
const token = 'ghp_abcdefghijklmnop'
const privateKey = '-----BEGIN RSA PRIVATE KEY-----...'

// ✅ Good patterns
const apiKey = process.env.ANTHROPIC_API_KEY
const password = process.env.DB_PASSWORD
const token = process.env.GITHUB_TOKEN
const privateKey = fs.readFileSync(process.env.KEY_PATH)
```

## Input Validation

### Validate All External Inputs

**Use Zod for runtime validation**:

```typescript
import { z } from 'zod'

// Define schema
const MessageSchema = z.object({
  content: z.string().min(1).max(10000),
  sessionId: z.string().uuid()
})

// Validate request body
export async function POST({ request }) {
  const body = await request.json()

  // Validate with Zod
  const result = MessageSchema.safeParse(body)
  if (!result.success) {
    return json({ error: 'Invalid input' }, { status: 400 })
  }

  const { content, sessionId } = result.data
  // Safe to use validated data
}
```

### Sanitize User Content

**For markdown/HTML content**:

```typescript
import { marked } from 'marked'
import DOMPurify from 'isomorphic-dompurify'

// Sanitize markdown before rendering
function sanitizeMarkdown(content: string): string {
  const html = marked.parse(content)
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'code', 'pre'],
    ALLOWED_ATTR: ['href', 'target']
  })
}
```

### Prevent Command Injection

**Bad**:
```typescript
// ❌ NEVER execute user input directly
import { exec } from 'child_process'

function processFile(filename: string) {
  exec(`cat ${filename}`)  // Command injection vulnerability!
}
```

**Good**:
```typescript
// ✅ Use parameterized APIs
import { readFile } from 'fs/promises'

async function processFile(filename: string) {
  // Validate filename
  if (!/^[a-zA-Z0-9_-]+\.txt$/.test(filename)) {
    throw new Error('Invalid filename')
  }

  const content = await readFile(`./data/${filename}`, 'utf-8')
  return content
}
```

## API Security

### Rate Limiting

Prevent API abuse with rate limiting:

```typescript
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later'
})

// Apply to routes
app.use('/api/', limiter)
```

### CORS Configuration

Restrict API access to known origins:

```typescript
// svelte.config.js
export default {
  kit: {
    csrf: {
      checkOrigin: true
    }
  }
}

// +server.ts - Add CORS headers
export async function POST({ request }) {
  const origin = request.headers.get('origin')

  const allowedOrigins = ['https://your-domain.com', 'http://localhost:5173']

  if (origin && !allowedOrigins.includes(origin)) {
    return new Response('Forbidden', { status: 403 })
  }

  // Process request...
}
```

### Authentication & Authorization

**Session-based authentication**:

```typescript
import { randomBytes } from 'crypto'

function generateSessionId(): string {
  return randomBytes(32).toString('hex')
}

function validateSessionId(sessionId: string): boolean {
  // Check format (UUID, hex, etc.)
  if (!/^[a-f0-9]{64}$/.test(sessionId)) {
    return false
  }

  // Check if session exists in database
  const session = getSession(sessionId)
  return session !== null
}
```

## Data Security

### Encryption at Rest

For sensitive data in database:

```typescript
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const algorithm = 'aes-256-gcm'
const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex') // 32 bytes

function encrypt(text: string): { encrypted: string, iv: string, tag: string } {
  const iv = randomBytes(16)
  const cipher = createCipheriv(algorithm, key, iv)

  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  return {
    encrypted,
    iv: iv.toString('hex'),
    tag: cipher.getAuthTag().toString('hex')
  }
}

function decrypt(encrypted: string, iv: string, tag: string): string {
  const decipher = createDecipheriv(algorithm, key, Buffer.from(iv, 'hex'))
  decipher.setAuthTag(Buffer.from(tag, 'hex'))

  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}
```

### Secure Password Storage

**Never store passwords in plain text**:

```typescript
import bcrypt from 'bcrypt'

// Hash password
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

// Verify password
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
```

## Dependency Security

### Regular Security Audits

```bash
# Run npm/pnpm audit
pnpm audit

# Fix vulnerabilities
pnpm audit --fix

# Check for outdated packages
pnpm outdated
```

### Automated Dependency Updates

**Use Dependabot**:

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
```

### Snyk for Vulnerability Scanning

```bash
# Install Snyk CLI
npm install -g snyk

# Authenticate
snyk auth

# Test for vulnerabilities
snyk test

# Monitor project
snyk monitor
```

## Error Handling

### Don't Leak Sensitive Information in Errors

**Bad**:
```typescript
// ❌ Leaks database connection string
try {
  await db.query(sql)
} catch (error) {
  throw new Error(`Database error: ${error}`)  // Exposes details!
}
```

**Good**:
```typescript
// ✅ Generic error message for users
try {
  await db.query(sql)
} catch (error) {
  console.error('Database error:', error)  // Log internally
  throw new Error('An error occurred. Please try again.')  // Generic message
}
```

## Security Headers

Configure security headers in SvelteKit:

```typescript
// hooks.server.ts
export async function handle({ event, resolve }) {
  const response = await resolve(event)

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  )

  return response
}
```

## CI/CD Security

### GitHub Actions Security

```yaml
# .github/workflows/security.yml
name: Security Checks

on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Run secret scanning
        run: |
          pip install detect-secrets
          detect-secrets scan --baseline .secrets.baseline

      - name: Run npm audit
        run: pnpm audit

      - name: Run Snyk
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

      - name: Run CodeQL
        uses: github/codeql-action/init@v2
        with:
          languages: javascript,typescript
```

## Development Workflow Integration

### Pre-commit Hooks

```json
// package.json
{
  "scripts": {
    "prepare": "husky install",
    "pre-commit": "lint-staged && pnpm run security:check"
  },
  "lint-staged": {
    "*.{ts,svelte}": [
      "eslint --fix",
      "prettier --write"
    ]
  },
  "devDependencies": {
    "husky": "^8.0.0",
    "lint-staged": "^14.0.0"
  }
}
```

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run tests
pnpm test

# Check for secrets
detect-secrets scan --baseline .secrets.baseline

# Run security audit
pnpm audit
```

## Security Checklist

Before committing code, ensure:

- [ ] No API keys, passwords, or secrets in code
- [ ] All sensitive data in `.env` file
- [ ] `.env` file added to `.gitignore`
- [ ] Input validation with Zod for all external inputs
- [ ] User content sanitized before rendering
- [ ] No command injection vulnerabilities
- [ ] Rate limiting on API endpoints
- [ ] CORS configured appropriately
- [ ] Security headers configured
- [ ] Dependencies audited (`pnpm audit`)
- [ ] Pre-commit hooks passing
- [ ] Error messages don't leak sensitive info

## Incident Response

### If a Secret is Leaked

1. **Immediately revoke the secret**:
   - Rotate API keys
   - Change passwords
   - Revoke tokens

2. **Remove from Git history**:
   ```bash
   # Use BFG Repo-Cleaner or git filter-repo
   git filter-repo --path-match '.env' --invert-paths
   ```

3. **Force push** (coordinate with team):
   ```bash
   git push origin --force --all
   ```

4. **Audit access logs**:
   - Check if leaked secret was used
   - Review API logs for suspicious activity

5. **Document incident**:
   - What was leaked
   - How it was leaked
   - Steps taken to remediate
   - Preventive measures

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [Snyk Vulnerability Database](https://snyk.io/vuln/)
- [GitHub Security Lab](https://securitylab.github.com/)
- [detect-secrets](https://github.com/Yelp/detect-secrets)

## Related Documentation

- [TypeScript Standards](./typescript-standards.md)
- [Testing Standards](./testing-standards.md)
- [System Architecture](../🏗️%20architecture/system-overview.md)

## Date
2025-11-07

## Maintainer
Project security standards
