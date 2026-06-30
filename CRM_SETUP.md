# D2 Dashboard Foundation Setup

This version adds the first Dashboard layer to the estimate app.

## What the app now captures

- Lead source
- File status
- Contact status
- Customer temperature
- Estimate status
- Inspection date and time
- Start date and arrival window
- Warranty status
- Next action and next action date
- Customer details
- Estimate details
- Materials, line items, notes, photos, and totals

## Google Drive structure

The Google Apps Script backend uses this parent folder:

`1SjVGZKYbdWzWqbbZ7zJ3mx1jNLtBi_4r`

When connected, every saved CRM file creates a customer folder:

`FILE-NUMBER - Client Name`

Inside each customer folder, it creates:

- `01 Estimates`
- `02 Photos`
- `03 Assignments`
- `04 Invoices and Payments`
- `05 Materials and Receipts`
- `06 Warranty`

It also creates or updates a Google Sheet named:

`D2 CRM Database`

## Connection step still needed

The app is ready, but `GOOGLE_SCRIPT_URL` in `app.js` is still blank.

To connect it:

1. Open Google Apps Script.
2. Paste the contents of `google-apps-script-backend.js`.
3. Deploy it as a web app.
4. Copy the web app URL.
5. Paste that URL into `GOOGLE_SCRIPT_URL` in `app.js`.

After that, the `Save Dashboard` / Google save flow will send the file into Google Drive and the database.
