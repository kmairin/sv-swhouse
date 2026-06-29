# SV & CO

Landing page for SV & CO — a team of Silicon Valley engineers returning to Thailand.

## Development

Open `index.html` in a browser, or use a local server:

```bash
npx live-server
```

## Deployment

Static site — push to `main` and enable GitHub Pages (deploy from root).

## Contact Form → Google Sheet

The homepage contact form (`#contact-form`) posts submissions to a Google Apps
Script web app, which appends each one as a row in a Google Sheet you own. No
backend or third-party service required — the data stays in your Google account.

1. **Create a Google Sheet** — this is where submissions will land.
2. In the Sheet, open **Extensions → Apps Script**. Delete the boilerplate and
   paste the contents of [`google-apps-script/contact-form.gs`](google-apps-script/contact-form.gs), then **Save**.
3. Click **Deploy → New deployment** and choose type **Web app**:
   - **Execute as:** Me
   - **Who has access:** Anyone
   Click **Deploy**, authorize when prompted, and copy the **Web app URL**
   (looks like `https://script.google.com/macros/s/AKfy.../exec`).
4. Paste that URL into `GOOGLE_SHEET_ENDPOINT` in `js/main.js`, then commit & push.

Submissions are stored as rows: `Timestamp | Name | Email | Company | Message`.

> Until `GOOGLE_SHEET_ENDPOINT` is set, the form runs in **placeholder mode**:
> it shows a success message to visitors but does not store anything yet.
