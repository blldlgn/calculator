# Google Ads Forecast Tool

Estimate Google Ads budget and ROI from your keywords.

## Features
- Next.js 14 + TypeScript, API routes
- Tailwind CSS, responsive + dark mode
- Recharts line chart
- Google Ads API integration (with fallback data)
- Export to CSV or Google Sheets (Looker Studio ready)
- Input validation, loading states

## Quickstart

```bash
npm install
npm run dev
```

Create `.env.local` with:

```
GOOGLE_ADS_DEVELOPER_TOKEN=
GOOGLE_ADS_CLIENT_ID=
GOOGLE_ADS_CLIENT_SECRET=
GOOGLE_ADS_REFRESH_TOKEN=
GOOGLE_ADS_LOGIN_CUSTOMER_ID=
GOOGLE_ADS_CUSTOMER_ID=
GOOGLE_SHEETS_ID=
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
NEXT_PUBLIC_APP_NAME=Google Ads Forecast Tool
```

- Google Ads first call guide: `https://developers.google.com/google-ads/api/docs/first-call/overview`
- Create a Google Cloud service account, share the target Sheet with the service account email.

## Usage
- Enter keywords (comma-separated), CPC, estimated monthly clicks, conversion rate %, ROAS, and campaign duration.
- Click Calculate to get estimated spend, revenue, ROI, and trends.
- Export CSV or Send to Looker Studio (saves to Google Sheets). Then in Looker Studio, create a new report and add Google Sheets connector pointing to your sheet.

## Deploy
- Configure environment variables in Vercel Project Settings.
- `vercel --prod` or push to main.

## Test Scenario
Example input: `ayakkabı`, CPC `2`, monthly clicks `500`, ROAS `4`, months `10` => Spend 10,000 TL, Revenue 40,000 TL.

## License
MIT
