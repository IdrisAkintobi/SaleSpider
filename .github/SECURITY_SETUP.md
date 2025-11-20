# GitHub Secrets Setup for CI/CD

## Required GitHub Secrets

To run CI workflows securely, configure the following secrets in your GitHub repository:

**Settings → Secrets and variables → Actions → New repository secret**

### CI/CD Secrets (Optional - Fallbacks Provided)

| Secret Name            | Description                      | Example Value                       |
| ---------------------- | -------------------------------- | ----------------------------------- |
| `CI_POSTGRES_PASSWORD` | PostgreSQL password for CI tests | `random_secure_test_password_123`   |
| `CI_JWT_SECRET`        | JWT secret for CI tests          | `random_jwt_secret_for_testing_456` |
| `CODECOV_TOKEN`        | Codecov upload token (optional)  | Get from codecov.io                 |

### Production Secrets (Never in CI)

**⚠️ NEVER add production secrets to GitHub Actions workflows!**

Production secrets should only be configured in your deployment environment:

- Docker `.env` file (not committed to git)
- Cloud provider secret managers (AWS Secrets Manager, etc.)
- Environment variables in hosting platform

## Security Best Practices

### ✅ DO:

- Use GitHub Secrets for sensitive values
- Provide fallback values for non-critical CI tests
- Use ephemeral test databases in CI
- Rotate secrets regularly
- Use different secrets for each environment

### ❌ DON'T:

- Hardcode passwords in workflow files
- Use production credentials in CI
- Commit secrets to version control
- Share secrets between environments
- Use weak or predictable test passwords

## CI Environment Security

The CI workflows use **ephemeral test credentials** that are:

- ✅ Destroyed after each test run
- ✅ Isolated in GitHub Actions containers
- ✅ Never exposed to production
- ✅ Different from production credentials

### Current Fallback Values (CI Only)

If GitHub Secrets are not configured, the workflows use these fallback values:

- `POSTGRES_PASSWORD`: `test_postgres_ci_only`
- `JWT_SECRET`: `test-jwt-secret-ci-only-do-not-use-in-production`

**These fallbacks are safe because:**

1. They only exist during test execution
2. They're destroyed immediately after
3. They have no access to production data
4. They're clearly marked as test-only

## Setting Up GitHub Secrets

### Step 1: Generate Secure Random Values

```bash
# Generate random secrets (Linux/macOS)
openssl rand -base64 32  # For CI_POSTGRES_PASSWORD
openssl rand -base64 32  # For CI_JWT_SECRET
```

### Step 2: Add to GitHub Repository

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with its name and value
5. Click **Add secret**

### Step 3: Verify CI Runs

- Push a commit or open a PR
- Check the Actions tab to verify CI passes
- Secrets will be masked in logs as `***`

## Codecov Integration (Optional)

If you want code coverage reports:

1. Sign up at [codecov.io](https://codecov.io)
2. Add your repository
3. Copy the upload token
4. Add as `CODECOV_TOKEN` secret in GitHub

## Questions?

- **Q: Are the fallback values secure?**  
  A: Yes, for CI testing. They're ephemeral and isolated.

- **Q: Should I add production secrets to GitHub?**  
  A: NO! Only use GitHub Secrets for CI/CD workflows.

- **Q: What if I accidentally commit a secret?**  
  A: Rotate it immediately and use `git filter-branch` to remove from history.

- **Q: Can I use the same secrets for staging/production?**  
  A: NO! Always use different secrets for each environment.

## Additional Resources

- [GitHub Actions Security Best Practices](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
- [Managing Secrets in GitHub Actions](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
