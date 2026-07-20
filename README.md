# Bengal Builders & Construction Ltd. (BBCL)

Premium multi-page static corporate website for **Bengal Builders & Construction Ltd.** — industrial infrastructure branding for deployment on GitHub Pages.

## Stack

- Semantic HTML5
- Tailwind CSS (CDN) + shared `css/site.css`
- Vanilla JavaScript (`js/main.js`) with GSAP + ScrollTrigger
- Google Fonts — Barlow Condensed (display) + Montserrat (body)

## Pages

| File | Purpose |
|------|---------|
| `index.html` | Landing — hero, value matrix, equipment tracker |
| `about.html` | Leadership, engineering registry, legal vault modals |
| `activities.html` | Technical services matrix |
| `materials.html` | Filterable aggregate e-catalogue + quote toasts |
| `projects.html` | Ongoing / completed project ledger |
| `js/main.js` | Shared nav, counters, tabs, modals, filters |

## Local preview

Open any HTML file in a browser, or serve the root folder:

```bash
npx serve .
# or: python3 -m http.server 8080
```

Then visit `http://localhost:3000` (or the port shown).

## GitHub Pages

1. Push this repository to GitHub.
2. **Settings → Pages → Build and deployment**
3. Source: **Deploy from a branch**
4. Branch: `main` (or your default) / folder: `/ (root)`
5. Save — site will be available at `https://<user>.github.io/<repo>/`

## Design system

- **Surfaces:** White `#FFFFFF` / Slate Light `#F8FAFC`
- **Accent:** Primary Blue `#1E40AF` / Teal `#0D9488`
- **Text:** Slate `#0F172A` / Slate Muted `#475569`

## Company

- Established: June 2021
- Location: Pritom Zaman Tower (13th Floor), 37/2, Purana Paltan, Dhaka-1000, Bangladesh
- Motto: Zero-incident workplace through teamwork, total commitment, extreme engineering precision, and advanced structural technology.
