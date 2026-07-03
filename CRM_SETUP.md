# D2 Dashboard Live Setup

This build is ready for a live Dashboard with Google Drive storage.

## Website Access

Use Wix as the front door:

`https://theoutchemist.wixsite.com/d2carpentry/blog`

Add a button or private link on that Wix page named:

`Open D2 Dashboard`

Point that button to the live GitHub Pages Dashboard:

`https://mynameisdav3.github.io/d2-estimate-studio-live/crm.html`

Do not embed the Dashboard inside Wix unless absolutely needed. Opening it as a full page avoids the scrolling issue.

## Google Drive Storage

The Google Apps Script backend uses this parent folder:

`1SjVGZKYbdWzWqbbZ7zJ3mx1jNLtBi_4r`

When connected, it creates or updates:

- `D2 Dashboard Database`
- `Files`
- `Revenue`
- `Price Database`
- `Estimate Submissions`
- Customer folders named `FILE-NUMBER - Client Name`

Each customer folder includes:

- `01 Estimates`
- `02 Photos`
- `03 Assignments`
- `04 Invoices and Payments`
- `05 Materials and Receipts`
- `06 Warranty`

## Connection Steps

1. Open Google Apps Script.
2. Create a new project named `D2 Dashboard Google Drive Backend`.
3. Paste the contents of `google-apps-script-backend.js`.
4. Deploy it as a Web App.
5. Set it to run as you.
6. Set access to anyone with the link.
7. Copy the Web App URL.
8. Open the Dashboard and click `Save Dashboard`.
9. Paste the Web App URL when the app asks for it.

The app remembers that Google link on that device after the first paste.
