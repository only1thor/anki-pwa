# Icon Generation

The PWA requires icons in multiple sizes. You can generate these in two ways:

## Option 1: Use an online tool

1. Go to https://www.pwabuilder.com/imageGenerator
2. Upload a 512x512 image (can be your app logo)
3. Download the generated icons
4. Place them in `public/icons/` directory

## Option 2: Use ImageMagick (if installed)

```bash
# Create a simple icon using ImageMagick
mkdir -p public/icons

# Generate icons in different sizes
for size in 72 96 128 144 152 192 384 512; do
  convert -size ${size}x${size} xc:'#6366f1' \
    -gravity center -pointsize $((size/2)) -fill white \
    -annotate +0+0 '🎴' \
    public/icons/icon-${size}x${size}.png
done
```

## Option 3: Create manually

For now, the PWA will work without icons. The manifest.json references them,
but the app will function correctly even if they're missing.

To add icons later:
1. Create PNG images in the sizes: 72, 96, 128, 144, 152, 192, 384, 512
2. Name them as `icon-{size}x{size}.png`
3. Place in `public/icons/` directory
