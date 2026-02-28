# GitHub Pages Deployment Guide

This repository includes a GitHub Actions workflow that automatically deploys your Anki PWA to GitHub Pages whenever you push to the `main` branch.

## 🚀 One-Time Setup (2 minutes)

### Step 1: Push to GitHub

If you haven't already, push your code to GitHub:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Anki PWA"

# Create repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### Step 2: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** (top menu)
3. Click **Pages** (left sidebar)
4. Under "Build and deployment":
   - **Source**: Select "GitHub Actions"
   - That's it! No need to select a branch

![GitHub Pages Settings](https://docs.github.com/assets/cb-122436/images/help/pages/publishing-source-drop-down.png)

### Step 3: Wait for Deployment

1. Go to the **Actions** tab in your repository
2. You'll see a "Deploy to GitHub Pages" workflow running
3. Wait 1-2 minutes for it to complete
4. Once done, your app will be live at:
   ```
   https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/
   ```

That's it! 🎉

## 🔄 Automatic Deployments

Every time you push to the `main` branch, GitHub Actions will:

1. ✅ Install dependencies
2. ✅ Build the production bundle
3. ✅ Deploy to GitHub Pages
4. ✅ Your site updates automatically!

## 📝 Configuration

### Using a Custom Domain

If you want to use a custom domain (e.g., `ankicards.yourdomain.com`):

1. **Add CNAME file**:
   Create `public/CNAME` with your domain:
   ```
   ankicards.yourdomain.com
   ```

2. **Update vite.config.ts**:
   ```typescript
   base: '/', // Use root for custom domain
   ```

3. **Configure DNS**:
   - Add a CNAME record pointing to `YOUR_USERNAME.github.io`
   - Or add A records pointing to GitHub's IPs:
     ```
     185.199.108.153
     185.199.109.153
     185.199.110.153
     185.199.111.153
     ```

4. **Enable in GitHub**:
   - Go to Settings → Pages
   - Enter your custom domain
   - Enable "Enforce HTTPS" (after DNS propagates)

### Using Repository as Subdirectory

If you want your app at `https://YOUR_USERNAME.github.io/anki-pwa/`:

Update `vite.config.ts`:

```typescript
base: '/anki-pwa/', // Your repo name
```

Then in the PWA manifest, update paths:

```typescript
scope: '/anki-pwa/',
start_url: '/anki-pwa/',
```

### Branch Configuration

To deploy from a different branch (e.g., `production`):

Edit `.github/workflows/deploy.yml`:

```yaml
on:
  push:
    branches: ["production"]  # Change from "main"
```

## 🛠️ Manual Deployment

To manually trigger a deployment:

1. Go to **Actions** tab
2. Click "Deploy to GitHub Pages"
3. Click "Run workflow"
4. Select branch and click "Run workflow"

## 🐛 Troubleshooting

### Workflow Fails

**Check Node.js version**:
The workflow uses Node.js 20. If you need a different version:

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'  # Change version here
```

**Check build locally**:
```bash
npm install
npm run build
```

If this fails, the GitHub Action will also fail.

### 404 Errors

**Base path mismatch**:
- If deployed to `username.github.io/repo-name/`, ensure `base` in `vite.config.ts` matches
- If using custom domain, use `base: '/'`

**Assets not loading**:
- Check browser console for 404 errors
- Verify paths in Network tab
- Ensure `base` config is correct

### Service Worker Issues

**Not registering**:
- HTTPS is required (GitHub Pages provides this)
- Check browser console for errors
- Clear service workers: DevTools → Application → Service Workers → Unregister

**Caching old version**:
- The service worker auto-updates
- Force update: Close all tabs and reopen
- Or unregister service worker and reload

### PWA Not Installing

**Check manifest**:
- Verify `manifest.webmanifest` loads without errors
- Check all icons exist (or remove icon references if not created)
- Use Lighthouse audit: DevTools → Lighthouse → Progressive Web App

**Generate icons** (optional):
If you want proper PWA icons, see [scripts/generate-icons.md](scripts/generate-icons.md)

The app works fine without icons, but they improve the install experience.

## 📊 Monitoring Deployments

### View Deployment Status

- **Actions tab**: See all workflow runs
- **Environments**: Settings → Environments → github-pages
- **Deployment history**: Each deployment is tracked

### View Logs

1. Go to Actions tab
2. Click on a workflow run
3. Click on "build" or "deploy" job
4. Expand steps to see detailed logs

### Deployment URL

After successful deployment, the workflow outputs the URL:

```
Deploy to GitHub Pages
Environment: github-pages
URL: https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/
```

## 🔐 Security

### Permissions

The workflow needs these permissions (already configured):

```yaml
permissions:
  contents: read      # Read repository code
  pages: write        # Deploy to Pages
  id-token: write     # Verify deployment
```

### Secrets

No secrets are needed! GitHub provides `GITHUB_TOKEN` automatically.

### Branch Protection

To prevent accidental deployments, enable branch protection:

1. Settings → Branches
2. Add rule for `main` branch
3. Enable "Require pull request reviews before merging"

## 🚀 Advanced Configuration

### Build Optimization

**Enable caching** (already included):
```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'  # Caches node_modules
```

**Speed up installs**:
```yaml
- name: Install dependencies
  run: npm ci  # Faster than npm install
```

### Multiple Environments

Deploy to staging and production:

```yaml
# .github/workflows/deploy-staging.yml
on:
  push:
    branches: ["develop"]

# Deploy to staging environment
environment:
  name: staging
  url: https://staging.yourdomain.com
```

### Build Matrix

Test multiple Node versions:

```yaml
strategy:
  matrix:
    node-version: [18, 20, 22]

steps:
  - uses: actions/setup-node@v4
    with:
      node-version: ${{ matrix.node-version }}
```

### Notifications

Get notified on deployment:

```yaml
- name: Notify on success
  if: success()
  run: |
    curl -X POST https://your-webhook-url \
      -d "Deployment successful!"
```

## 📈 Performance

### Build Time

Typical build times:
- First run: ~2-3 minutes (no cache)
- Subsequent runs: ~1-2 minutes (with cache)

### Deploy Size

- Source: ~2,500 lines
- Build output: ~300 KB
- Gzipped: ~77 KB
- Transfer time: < 1 second on good connection

### Optimization Tips

1. **Preinstall dependencies**: Already using `npm ci`
2. **Cache node_modules**: Already configured
3. **Concurrent jobs**: Build and deploy run in sequence (required)
4. **Skip runs**: Configure `concurrency` to skip redundant builds

## 🎯 What Gets Deployed

The workflow deploys everything in the `dist/` folder:

```
dist/
├── index.html
├── manifest.webmanifest
├── sw.js (service worker)
├── workbox-*.js
├── assets/
│   ├── index-*.css
│   └── index-*.js
└── vite.svg
```

**Not deployed**:
- `node_modules/`
- `src/` source code
- `package.json`
- `.env` files
- Documentation files

Only the production build is deployed!

## 🔄 Updating Your Site

Just push to main:

```bash
git add .
git commit -m "Update feature X"
git push
```

GitHub Actions handles the rest automatically!

## 📚 Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/pages)
- [GitHub Actions Documentation](https://docs.github.com/actions)
- [Vite Build Documentation](https://vitejs.dev/guide/build.html)
- [PWA Manifest Spec](https://developer.mozilla.org/en-US/docs/Web/Manifest)

## 🎉 Success!

Once deployed, your app will:

- ✅ Be live at your GitHub Pages URL
- ✅ Auto-deploy on every push
- ✅ Work offline as a PWA
- ✅ Be accessible worldwide via CDN
- ✅ Support HTTPS automatically
- ✅ Cost $0 to host

Enjoy your deployed Anki PWA! 🚀

---

**Need help?** Check the [main README](README.md) or open an issue!
