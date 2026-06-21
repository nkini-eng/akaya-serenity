# Akaya Serenity

A fresh static website for Akaya Serenity, built as a lightweight brochure site with a luxury nature resort theme. The site is plain HTML/CSS/JS and can be deployed on any static hosting platform.

## Included Pages

- `index.html` — home page
- `our-story.html` — brand story and vision
- `the-setting.html` — location and surroundings
- `experience.html` — guest experience highlights
- `gallery.html` — image gallery
- `plan.html` — stay and booking details
- `enquiry.html` — contact / enquiry form page

## Assets

- `assets/css/style.css` — global styling
- `assets/js/main.js` — interactive site scripts (nav, scroll state)
- `assets/js/contact.js` — injects shared contact details from `assets/data/contact.json`
- `assets/js/enquiry-config.js` — EmailJS settings for enquiry email verification
- `assets/js/enquiry-auth.js` — enquiry validation, email OTP, and WhatsApp send
- `assets/images/` — site images and media assets (`*-opt.webp` / `*-opt.jpg` are the optimized versions used by the pages)

## Image Optimization

Large source PNGs are converted to compressed WebP (with a small JPEG/PNG fallback)
by a dev-only script. Re-run it whenever the source images change:

```bash
cd tools
npm install
npm run optimize:images
```

This writes `*-opt.webp` and a fallback next to each source image in
`assets/images/`. The originals are left untouched. `akaya-launch.png`
(used only by the Coming Soon `index.html`) is intentionally skipped.

## Enquiry (WhatsApp + Email)

The enquiry page offers **two independent channels** side by side:

| Channel | Verification | Delivery |
|---------|--------------|----------|
| **WhatsApp** | +91 phone format + required message | Opens WhatsApp with a prefilled message |
| **Email** | 6-digit OTP to visitor's email (EmailJS, optional) | Sends enquiry to Akaya's inbox via EmailJS |

Setup requires a free [EmailJS](https://www.emailjs.com/) account (no credit card, ~200 emails/month).
Create **two templates** — one for OTP verification, one for enquiry delivery — and paste
the IDs into [`assets/js/enquiry-config.js`](assets/js/enquiry-config.js). Add
`https://akayaserenity.com` (and `http://localhost:8000` for local testing) under
EmailJS → Account → Security → Allowed origins.

Until EmailJS is configured, WhatsApp enquiries work normally; the email form shows a notice
and stays disabled.

## Local Testing

1. Open a terminal in the project root.
2. Run a local server (serves custom `404.html` on missing pages):

```bash
python3 tools/serve.py
```

Or use the basic server (no custom 404):

```bash
python3 -m http.server 8000
```

3. Open in your browser:

```bash
http://localhost:8000
```

> Note: `index.html` must remain the homepage file name for most static hosts.

## Deployment

This site can be hosted as static files without a build step.

- GitHub Pages: enable Pages in the repository settings and use the branch containing these files.
- Netlify / Vercel: connect the repository and deploy the root folder.
- Other static hosts: upload all files and preserve `index.html` at the root.

## Custom Domain

The repository already contains a `CNAME` file. Configure your DNS and hosting provider to point `AKAYASERENITY.COM` to the deployed site.

## Notes

- Keep the folder structure intact when deploying.
- A custom `404.html` page is included.
- The `tools/` folder is dev-only; its `node_modules/` is git-ignored and does not need to be deployed.
- Optionally add a `LICENSE` file to clarify reuse terms.
