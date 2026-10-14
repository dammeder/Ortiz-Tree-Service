const SHEET_NAME = "Leads";
// Temporary test recipient. Replace with Ozzy's preferred email before launch.
const NOTIFY_EMAIL = "mederemilev04@gmail.com";

function doGet() {
  return jsonResponse_({ ok: true, service: "Ozzy's Tree Service lead form" });
}

function doPost(event) {
  try {
    const payload = parsePayload_(event);

    // Silently accept honeypot submissions so bots do not learn the filter.
    if (clean_(payload.website)) {
      return jsonResponse_({ ok: true });
    }

    const lead = {
      name: clean_(payload.name),
      phone: clean_(payload.phone),
      email: clean_(payload.email),
      service: clean_(payload.service),
      address: clean_(payload.address),
      timeline: clean_(payload.timeline),
      contactPreference: clean_(payload.contactpref),
      details: clean_(payload.details),
      page: clean_(payload.page),
    };

    if (!lead.name || !lead.phone || !lead.service || !lead.timeline) {
      return jsonResponse_({ ok: false, error: "Missing required fields" });
    }

    const now = new Date();
    const leadId = `OTS-${Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyyMMdd")}-${Utilities.getUuid().slice(0, 6).toUpperCase()}`;
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet && spreadsheet.getSheetByName(SHEET_NAME);

    if (!sheet) {
      throw new Error(`Sheet named "${SHEET_NAME}" was not found.`);
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      sheet.appendRow([
        now,
        leadId,
        lead.name,
        lead.phone,
        lead.email,
        lead.service,
        lead.address,
        lead.timeline,
        lead.contactPreference,
        lead.details,
        lead.page,
        "New",
        "",
        "",
      ]);
    } finally {
      lock.releaseLock();
    }

    sendLeadEmail_(lead, leadId, now);
    return jsonResponse_({ ok: true, leadId });
  } catch (error) {
    console.error(error);
    return jsonResponse_({ ok: false, error: String(error.message || error) });
  }
}

function parsePayload_(event) {
  if (!event || !event.postData || !event.postData.contents) {
    throw new Error("Empty request body");
  }
  return JSON.parse(event.postData.contents);
}

function sendLeadEmail_(lead, leadId, receivedAt) {
  if (!NOTIFY_EMAIL || NOTIFY_EMAIL.includes("PASTE_")) return;

  const subject = `New ${lead.service} lead — ${lead.name}`;
  const fields = [
    ["Lead ID", leadId],
    ["Received", Utilities.formatDate(receivedAt, Session.getScriptTimeZone(), "MMM d, yyyy h:mm a")],
    ["Name", lead.name],
    ["Phone", lead.phone],
    ["Email", lead.email || "Not provided"],
    ["Service", lead.service],
    ["Timeline", lead.timeline],
    ["Contact preference", lead.contactPreference || "Not provided"],
    ["Address", lead.address || "Not provided"],
    ["Details", lead.details || "Not provided"],
    ["Page", lead.page || "Not provided"],
  ];

  const body = fields.map(([label, value]) => `${label}: ${value}`).join("\n");
  const rows = fields.map(([label, value]) =>
    `<tr><td style="padding:6px 12px 6px 0;font-weight:700;vertical-align:top">${escapeHtml_(label)}</td><td style="padding:6px 0">${escapeHtml_(value)}</td></tr>`
  ).join("");

  try {
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject,
      body,
      htmlBody: `<h2 style="font-family:Arial,sans-serif">New website estimate request</h2><table style="font-family:Arial,sans-serif;border-collapse:collapse">${rows}</table>`,
      name: "Ozzy's Tree Service Website",
    });
  } catch (error) {
    // The lead is already safely stored. Log notification failures separately.
    console.error(`Lead ${leadId} saved, but email notification failed:`, error);
  }
}

function clean_(value) {
  return String(value == null ? "" : value).trim().slice(0, 5000);
}

function escapeHtml_(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function jsonResponse_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
