import type { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = req.body?.payload
      ? JSON.parse(decodeURIComponent(String(req.body.payload)))
      : req.body;

    const sheets = google.sheets('v4');

    const jwt = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    await jwt.authorize();

    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
    if (!spreadsheetId) {
      return res.status(400).json({ error: 'Missing GOOGLE_SHEETS_ID' });
    }

    // Append a new row with core metrics; adjust columns as needed
    const coreValues = [
      new Date().toISOString(),
      payload.totalSpend,
      payload.totalRevenue,
      payload.roiPct,
      payload.estimatedCpc,
      payload.estimatedCpm,
    ];

    await sheets.spreadsheets.values.append({
      auth: jwt,
      spreadsheetId,
      range: 'Sheet1!A:F',
      valueInputOption: 'RAW',
      requestBody: { values: [coreValues] },
    });

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to export to Google Sheets' });
  }
}
