import { google } from "googleapis";

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { name, phone, city, summary } = req.body;

    if (!name || !phone || !city || !summary) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Google Auth
    const auth = new google.auth.JWT(
      process.env.GOOGLE_CLIENT_EMAIL,
      null,
      process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      ["https://www.googleapis.com/auth/spreadsheets"]
    );

    const sheets = google.sheets({ version: "v4", auth });

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Sheet1!A:E",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            new Date().toLocaleString("en-IN"),
            name,
            phone,
            city,
            summary
          ]
        ]
      }
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("SAVE LEAD ERROR:", error);
    return res.status(500).json({ error: "Failed to save lead" });
  }
}
