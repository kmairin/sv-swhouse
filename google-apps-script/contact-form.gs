/**
 * SV & CO — Contact form → Google Sheet
 *
 * Receives POST submissions from the website contact form (see js/main.js)
 * and appends each one as a row in this spreadsheet.
 *
 * Setup instructions: see README.md → "Contact Form → Google Sheet".
 */

var SHEET_NAME = 'Contacts';

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.getActiveSheet();

    // Add a header row the first time a submission comes in.
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp', 'Name', 'Email', 'Company', 'Message']);
    }

    var p = (e && e.parameter) ? e.parameter : {};
    sheet.appendRow([
      new Date(),
      p.name || '',
      p.email || '',
      p.company || '',
      p.message || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Optional: open the web app URL in a browser to confirm the endpoint is live.
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ result: 'ok', info: 'SV & CO contact endpoint is live.' }))
    .setMimeType(ContentService.MimeType.JSON);
}
