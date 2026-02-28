# Quick Deploy Reference Card

## 🚀 Deploy to GitHub Pages (Automatic)

### First Time Setup (1 minute)
```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main

# 2. Enable GitHub Pages
# Go to: Settings → Pages → Source: "GitHub Actions"

# 3. Wait 2 minutes - Done!
# Your app: https://USERNAME.github.io/REPO/
```

**That's it!** Every push to `main` auto-deploys.

---

## 🌐 Other Quick Deploy Options

### Netlify (30 seconds)
1. Go to https://app.netlify.com/drop
2. Drag `dist/` folder
3. Done!

### Vercel (2 minutes)
```bash
npm install -g vercel
vercel --prod
```

### Cloudflare Pages (2 minutes)
1. Push to GitHub
2. Connect at https://pages.cloudflare.com
3. Build command: `npm run build`
4. Output: `dist`

---

## 🔧 Build Commands

```bash
# Development
npm run dev          # http://localhost:5173

# Production
npm run build        # Output: dist/
npm run preview      # Test build locally

# With Nix
nix develop -c npm run dev
nix develop -c npm run build
```

---

## 📊 What Gets Deployed

```
dist/ (300 KB total, 77 KB gzipped)
├── index.html
├── manifest.webmanifest (PWA config)
├── sw.js (offline support)
└── assets/
    ├── index-*.css (4.3 KB)
    └── index-*.js (238 KB)
```

---

## 🐛 Quick Troubleshooting

**Build fails?**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

**GitHub Action fails?**
- Check Actions tab for logs
- Verify Node.js version (20)
- Ensure Pages is enabled in Settings

**404 on deployed site?**
- Check `base` in `vite.config.ts`
- For custom domain: use `base: '/'`
- For repo subdirectory: use `base: '/repo-name/'`

---

## 📚 Full Documentation

- **GitHub Pages**: [GITHUB_PAGES.md](GITHUB_PAGES.md)
- **All Platforms**: [DEPLOY.md](DEPLOY.md)
- **Development**: [DEVELOPMENT.md](DEVELOPMENT.md)
- **Quick Start**: [QUICKSTART.md](QUICKSTART.md)

---

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Pages enabled in Settings
- [ ] GitHub Action workflow ran successfully
- [ ] Site loads at GitHub Pages URL
- [ ] PWA installs correctly
- [ ] Offline mode works
- [ ] All features functional

**Need custom domain?** See [GITHUB_PAGES.md](GITHUB_PAGES.md#using-a-custom-domain)

---

**Your app is production-ready!** 🎉

No backend, no database, no server costs. Just push and deploy!
