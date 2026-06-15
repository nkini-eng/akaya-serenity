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
- `assets/js/main.js` — interactive site scripts
- `assets/images/` — site images and media assets

## Local Testing

1. Open a terminal in the project root.
2. Run a local server:

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
- Add a `404.html` page if you want a custom not-found experience.
- Optionally add a `LICENSE` file to clarify reuse terms.
