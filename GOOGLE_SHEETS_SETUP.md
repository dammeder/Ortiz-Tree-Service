# Google Sheets lead form setup

The website form posts to a Google Apps Script web app. Each submission is added to the `Leads` sheet and can send Ozzy a free email notification.

## Current deployment

- Sheet: [Ozzy's Tree Service Leads](https://docs.google.com/spreadsheets/d/1MSX-Q7Cf9xDHawYtPKNMp40tcNuYNT4nQ8Ig4fxxK7s/edit)
- Web app: `https://script.google.com/macros/s/AKfycbw-lrovxlJqwch_I0Sd1ROoLj6VT_0OeIF_bDolgWQsOLox_sBt8inT6d5SmyNCjiyj/exec`
- Temporary notification recipient: `mederemilev04@gmail.com`
- Verified October 13, 2026 with a full website-form submission in regular Chrome: lead `OTS-20261013-43C59B` reached Sheet row 10 and the matching email arrived. Rows 8–10 are clearly labeled test records.

Replace the temporary recipient with Ozzy's preferred email before launch, then deploy a new version and run one more test.

## Connect the backend

1. Open the **Ozzy's Tree Service Leads** Google Sheet.
2. Go to **Extensions → Apps Script**.
3. Replace the editor contents with `google-apps-script.gs` from this repository.
4. Confirm `NOTIFY_EMAIL`. It currently points to Meder's email for testing; replace it with Ozzy's preferred email before launch.
5. In Apps Script, open **Project Settings** and set the time zone to **America/New_York**.
6. Click **Deploy → New deployment → Web app**.
7. Set **Execute as** to **Me** and **Who has access** to **Anyone**.
8. Authorize the script, deploy it, and copy the `/exec` URL.
9. Paste that URL into `SCRIPT_URL` in `script.js`.

After deployment, submit one test request from the website. Confirm that a new row appears, the Status is `New`, and the notification email arrives.

## Updating later

When `google-apps-script.gs` changes, update the Apps Script project and deploy a **new version** under **Manage deployments**. The existing `/exec` URL stays the same.
