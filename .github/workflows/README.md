# GitHub Actions Workflows

This directory contains GitHub Actions workflows for CI/CD.

## 📁 Workflows

### `deploy.yml` - Deploy to GitHub Pages

Automatically deploys the Anki PWA to GitHub Pages on every push to `main`.

**Triggers:**
- Push to `main` branch
- Manual trigger via Actions tab

**What it does:**
1. Checks out code
2. Sets up Node.js 20
3. Installs dependencies with `npm ci`
4. Builds production bundle with `npm run build`
5. Uploads build artifact
6. Deploys to GitHub Pages

**Permissions required:**
- `contents: read` - Read repository
- `pages: write` - Deploy to Pages
- `id-token: write` - Verify deployment

**Typical runtime:** 1-2 minutes

## 🚀 Setup

See [GITHUB_PAGES.md](../../GITHUB_PAGES.md) for complete setup instructions.

Quick setup:
1. Push code to GitHub
2. Go to Settings → Pages
3. Set source to "GitHub Actions"
4. Done!

## 🔧 Customization

### Change deploy branch

```yaml
on:
  push:
    branches: ["your-branch"]
```

### Change Node.js version

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '18' # or 20, 22
```

### Add tests before deploy

```yaml
- name: Run tests
  run: npm test

- name: Build
  run: npm run build
```

### Deploy to different environment

```yaml
deploy:
  environment:
    name: production  # or staging, development
    url: https://your-domain.com
```

## 📊 Monitoring

View workflow runs:
- **Actions tab** in your repository
- Click on a run to see detailed logs
- Check "build" and "deploy" job outputs

## 🐛 Troubleshooting

**Build fails:**
- Check if `npm run build` works locally
- Verify Node.js version compatibility
- Check for TypeScript errors

**Deploy fails:**
- Ensure Pages is enabled in Settings
- Verify workflow permissions
- Check branch protection rules

**404 errors after deploy:**
- Verify `base` path in `vite.config.ts`
- Check if deploying to subdirectory vs custom domain
- See [GITHUB_PAGES.md](../../GITHUB_PAGES.md#troubleshooting)

## 📚 Resources

- [GitHub Actions Docs](https://docs.github.com/actions)
- [GitHub Pages Docs](https://docs.github.com/pages)
- [Workflow Syntax](https://docs.github.com/actions/reference/workflow-syntax-for-github-actions)
