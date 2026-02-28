# Deployment Guide

Your Anki PWA is **100% static** and can be deployed to any static hosting service!

## ✅ Build Successful

The production build is in the `dist/` directory:

```
dist/
├── index.html                     # Main HTML file
├── manifest.webmanifest          # PWA manifest
├── registerSW.js                 # Service worker registration
├── sw.js                         # Service worker
├── workbox-1d305bb8.js          # Workbox runtime
└── assets/
    ├── index-0YsL0Mxg.css       # Styles (4.39 KB, 1.49 KB gzipped)
    └── index-nLr9CjY0.js        # JavaScript (238 KB, 77 KB gzipped)
```

**Total bundle size: ~77 KB gzipped** 🚀

## Deployment Options

### 1. Netlify (Easiest)

#### Option A: Drag & Drop
1. Go to https://app.netlify.com/drop
2. Drag the `dist/` folder onto the page
3. Done! You'll get a URL like `https://your-app.netlify.app`

#### Option B: Git Deploy
1. Push your code to GitHub
2. Go to https://app.netlify.com
3. Click "Add new site" → "Import an existing project"
4. Connect your repository
5. Configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Click "Deploy"

**Custom domain**: Configure in Netlify settings

### 2. Vercel

1. Push your code to GitHub
2. Go to https://vercel.com
3. Click "Import Project"
4. Select your repository
5. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Click "Deploy"

**Custom domain**: Configure in Vercel settings

### 3. GitHub Pages

Add to `package.json`:

```json
{
  "scripts": {
    "deploy": "npm run build && npx gh-pages -d dist"
  }
}
```

Then:

```bash
npm install -D gh-pages
npm run deploy
```

Your app will be at `https://yourusername.github.io/anki-pwa`

**Note**: For GitHub Pages, you may need to update the base URL in `vite.config.ts`:

```typescript
export default defineConfig({
  base: '/anki-pwa/', // Your repo name
  // ... rest of config
});
```

### 4. Cloudflare Pages

1. Push your code to GitHub
2. Go to https://pages.cloudflare.com
3. Click "Create a project"
4. Connect your repository
5. Configure:
   - **Framework preset**: None
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
6. Click "Save and Deploy"

### 5. Self-Hosted (nginx/Apache)

#### Using nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /var/www/anki-pwa/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Enable gzip
    gzip on;
    gzip_types text/css application/javascript application/json;
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Using Apache

Create `.htaccess` in `dist/`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Enable gzip
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>
```

### 6. AWS S3 + CloudFront

1. Create S3 bucket for static website hosting
2. Upload `dist/` contents
3. Configure bucket for public access
4. Create CloudFront distribution pointing to S3
5. Configure HTTPS certificate

### 7. Docker (if needed)

Create `Dockerfile`:

```dockerfile
FROM nginx:alpine

COPY dist/ /usr/share/nginx/html/

# Custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:

```bash
docker build -t anki-pwa .
docker run -p 8080:80 anki-pwa
```

## Important Notes

### ⚠️ HTTPS Required for PWA

PWAs **require HTTPS** in production for:
- Service workers
- Install prompt
- Full offline functionality

Most hosting services (Netlify, Vercel, etc.) provide HTTPS automatically.

### 📱 Testing PWA Features

After deployment:

1. **Test Installation**:
   - Desktop: Look for install icon in address bar
   - Mobile: Use "Add to Home Screen"

2. **Test Offline**:
   - Open DevTools → Network
   - Check "Offline" checkbox
   - Reload page - should still work!

3. **Test Service Worker**:
   - Open DevTools → Application → Service Workers
   - Verify service worker is active

### 🔄 Updating the App

When you deploy updates:

1. The service worker will automatically update
2. Users will get the new version on next reload
3. Or they can force update by closing all tabs

### 🎨 Custom Domain

All major hosting services support custom domains:

1. Buy domain (e.g., Namecheap, Google Domains)
2. Add DNS records pointing to your host
3. Configure SSL certificate (usually automatic)

Example: `ankicards.yourdomain.com`

### 📊 Analytics (Optional)

To add analytics, add to `index.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

Or use privacy-friendly alternatives:
- Plausible Analytics
- Fathom Analytics
- Simple Analytics

### 🔒 Security Headers

Add these headers for better security (hosting-dependent):

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

Most hosts let you configure this in their settings.

## Quick Deploy Commands

### Build for production
```bash
npm run build
```

### Preview production build locally
```bash
npm run preview
```

### Deploy to Netlify (with CLI)
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### Deploy to Vercel (with CLI)
```bash
npm install -g vercel
vercel --prod
```

## Environment-Specific Builds

If you need different configs for different environments:

```typescript
// vite.config.ts
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/anki-pwa/' : '/',
  // ... other config
}));
```

## Troubleshooting

### Build fails
- Check Node.js version: `node --version` (should be 20+)
- Clear cache: `rm -rf node_modules package-lock.json && npm install`
- Check TypeScript errors: `npm run type-check`

### Service worker not working
- Ensure HTTPS is enabled
- Check browser console for errors
- Clear service worker: DevTools → Application → Service Workers → Unregister

### App not installing as PWA
- Verify manifest.webmanifest is accessible
- Check all required manifest fields are present
- Ensure icons exist in correct sizes
- Use Lighthouse audit to check PWA score

### Images/assets not loading
- Check file paths are relative
- Verify files are in `public/` or imported in JS
- Check browser console for 404 errors

## Performance Tips

### Enable HTTP/2
Most modern hosts enable this by default, but verify.

### Enable Brotli compression
Better than gzip for text files. Enable in hosting settings.

### Use CDN
Most hosts (Netlify, Vercel, Cloudflare Pages) include CDN automatically.

### Lazy load icons
Only generate icons you need initially. Can add more later.

## Monitoring

### Free monitoring options:
- **Uptime**: UptimeRobot, Better Uptime
- **Performance**: Google PageSpeed Insights, WebPageTest
- **Errors**: Sentry (free tier)
- **PWA Score**: Lighthouse CI

## Cost

All these options have **generous free tiers**:

| Service | Free Tier | Bandwidth | Custom Domain |
|---------|-----------|-----------|---------------|
| Netlify | 100 GB/month | Yes | Yes |
| Vercel | 100 GB/month | Yes | Yes |
| GitHub Pages | 100 GB/month | Yes | Yes |
| Cloudflare Pages | Unlimited | Yes | Yes |

Your app is so small (~77 KB) that you'll likely never exceed free tiers!

## Recommended: Netlify or Vercel

For easiest deployment with best features:

1. **Netlify**: Best for drag-and-drop simplicity
2. **Vercel**: Best for git-based workflow

Both provide:
- ✅ Automatic HTTPS
- ✅ CDN included
- ✅ Custom domains
- ✅ Automatic deploys from git
- ✅ Preview deploys for PRs
- ✅ Generous free tier

## Questions?

Check the main [README.md](README.md) or [DEVELOPMENT.md](DEVELOPMENT.md) for more info.

---

**Your app is ready to deploy!** 🚀

Just pick a hosting service, upload the `dist/` folder, and you're live!
