const DRIVE_PARENT_FOLDER_ID = "1SjVGZKYbdWzWqbbZ7zJ3mx1jNLtBi_4r";
const CRM_SHEET_NAME = "D2 Dashboard Database";

const SHEETS = {
  files: "Files",
  revenue: "Revenue",
  prices: "Price Database",
  submissions: "Estimate Submissions",
};

function doPost(e) {
  try {
    const payload = parsePayload_(e);
    const parentFolder = DriveApp.getFolderById(DRIVE_PARENT_FOLDER_ID);
    const spreadsheet = getOrCreateDatabase_(parentFolder);
    const action = String(payload.action || "estimateSubmit");

    if (action === "dashboardSync") {
      return jsonResponse_(saveDashboardSync_(payload, parentFolder, spreadsheet));
    }

    return jsonResponse_(saveEstimateSubmission_(payload, parentFolder, spreadsheet));
  } catch (error) {
    return jsonResponse_({ ok: false, error: String(error && error.message ? error.message : error) });
  }
}

function doGet() {
  return ContentService
    .createTextOutput("D2 Dashboard Google Drive connection is live.")
    .setMimeType(ContentService.MimeType.TEXT);
}

function saveDashboardSync_(payload, parentFolder, spreadsheet) {
  const files = Array.isArray(payload.dashboardFiles) ? payload.dashboardFiles : [];
  const revenueRows = Array.isArray(payload.revenueRows) ? payload.revenueRows : [];
  const priceRows = Array.isArray(payload.priceRows) ? payload.priceRows : [];

  upsertTextFile_(
    parentFolder,
    "D2 Dashboard Sync - latest.json",
    JSON.stringify(payload, null, 2),
    MimeType.PLAIN_TEXT
  );

  const fileSheet = getSheet_(spreadsheet, SHEETS.files, fileHeaders_());
  replaceRows_(fileSheet, fileHeaders_(), files.map((file) => {
    const folder = getOrCreateCustomerFolder_(parentFolder, file);
    createStandardSubfolders_(folder);
    upsertTextFile_(folder, "Dashboard File.json", JSON.stringify(file, null, 2), MimeType.PLAIN_TEXT);
    return fileRow_(file, folder.getUrl());
  }));

  const revenueSheet = getSheet_(spreadsheet, SHEETS.revenue, revenueHeaders_());
  replaceRows_(revenueSheet, revenueHeaders_(), revenueRows.map(revenueRow_));

  const priceSheet = getSheet_(spreadsheet, SHEETS.prices, priceHeaders_());
  replaceRows_(priceSheet, priceHeaders_(), priceRows.map(priceRow_));

  return {
    ok: true,
    action: "dashboardSync",
    fileCount: files.length,
    revenueCount: revenueRows.length,
    priceCount: priceRows.length,
    databaseUrl: spreadsheet.getUrl(),
    driveUrl: parentFolder.getUrl(),
  };
}

function saveEstimateSubmission_(payload, parentFolder, spreadsheet) {
  const file = estimatePayloadToFile_(payload);
  const customerFolder = getOrCreateCustomerFolder_(parentFolder, file);
  createStandardSubfolders_(customerFolder);

  upsertTextFile_(
    customerFolder,
    `${cleanName_(file.fileNumber)} - editable-estimate.d2estimate`,
    JSON.stringify(payload, null, 2),
    MimeType.PLAIN_TEXT
  );

  const copies = payload.copies || {};
  Object.keys(copies).forEach((key) => {
    const copy = copies[key] || {};
    if (!copy.html) return;
    upsertTextFile_(
      customerFolder,
      `${cleanName_(file.fileNumber)} - ${cleanName_(copy.label || key)}.html`,
      copy.html,
      MimeType.HTML
    );
  });

  const submissionSheet = getSheet_(spreadsheet, SHEETS.submissions, submissionHeaders_());
  upsertRowByKey_(submissionSheet, submissionHeaders_(), file.fileNumber, submissionRow_(payload, customerFolder.getUrl()));

  const fileSheet = getSheet_(spreadsheet, SHEETS.files, fileHeaders_());
  upsertRowByKey_(fileSheet, fileHeaders_(), file.fileNumber, fileRow_(file, customerFolder.getUrl()));

  return {
    ok: true,
    action: "estimateSubmit",
    fileNumber: file.fileNumber,
    folderUrl: customerFolder.getUrl(),
    databaseUrl: spreadsheet.getUrl(),
  };
}

function estimatePayloadToFile_(payload) {
  const totals = payload.totals || {};
  const backend = payload.backend || {};
  return {
    fileNumber: payload.estimateNumber || `D2-${Date.now()}`,
    clientName: payload.clientName || "Unnamed Client",
    clientPhone: payload.clientPhone || "",
    clientEmail: payload.clientEmail || "",
    projectAddress: payload.projectAddress || "",
    leadSource: payload.leadSource || "Manual",
    projectType: payload.projectType || "Other",
    fileStatus: payload.fileStatus || "Inspection Completed",
    statusDetail: payload.statusDetail || "Estimate Pending",
    estimateTotal: Number(totals.total) || 0,
    materialTotal: Number(backend.estimatedMaterialCost) || 0,
    initialDeposit: "",
    midpointDeposit: "",
    finalPaymentAmount: "",
    paidInFull: payload.invoicePaid === true ? "Yes" : "No",
    nextAction: payload.nextAction || "",
    nextActionDate: payload.nextActionDate || "",
  };
}

function getOrCreateDatabase_(parentFolder) {
  const files = parentFolder.getFilesByName(CRM_SHEET_NAME);
  if (files.hasNext()) return SpreadsheetApp.open(files.next());

  const spreadsheet = SpreadsheetApp.create(CRM_SHEET_NAME);
  const file = DriveApp.getFileById(spreadsheet.getId());
  parentFolder.addFile(file);
  DriveApp.getRootFolder().removeFile(file);

  getSheet_(spreadsheet, SHEETS.files, fileHeaders_());
  getSheet_(spreadsheet, SHEETS.revenue, revenueHeaders_());
  getSheet_(spreadsheet, SHEETS.prices, priceHeaders_());
  getSheet_(spreadsheet, SHEETS.submissions, submissionHeaders_());
  return spreadsheet;
}

function getSheet_(spreadsheet, sheetName, headers) {
  const sheet = spreadsheet.getSheetByName(sheetName) || spreadsheet.insertSheet(sheetName);
  ensureHeader_(sheet, headers);
  return sheet;
}

function ensureHeader_(sheet, headers) {
  const firstRow = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  const hasHeader = firstRow.some((value) => String(value || "").trim());
  if (!hasHeader) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
    return;
  }
  headers.forEach((header, index) => {
    if (firstRow[index] !== header) sheet.getRange(1, index + 1).setValue(header);
  });
}

function replaceRows_(sheet, headers, rows) {
  sheet.clearContents();
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1);
  if (rows.length) {
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }
  sheet.autoResizeColumns(1, headers.length);
}

function upsertRowByKey_(sheet, headers, key, row) {
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    const keys = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
    for (let index = 0; index < keys.length; index += 1) {
      if (String(keys[index][0]) === String(key)) {
        sheet.getRange(index + 2, 1, 1, headers.length).setValues([row]);
        return;
      }
    }
  }
  sheet.appendRow(row);
}

function getOrCreateCustomerFolder_(parentFolder, file) {
  const fileNumber = cleanName_(file.fileNumber || `D2-${Date.now()}`);
  const clientName = cleanName_(file.clientName || "Unnamed Client");
  return getOrCreateChildFolder_(parentFolder, `${fileNumber} - ${clientName}`);
}

function createStandardSubfolders_(customerFolder) {
  [
    "01 Estimates",
    "02 Photos",
    "03 Assignments",
    "04 Invoices and Payments",
    "05 Materials and Receipts",
    "06 Warranty",
  ].forEach((name) => getOrCreateChildFolder_(customerFolder, name));
}

function getOrCreateChildFolder_(parentFolder, name) {
  const folders = parentFolder.getFoldersByName(name);
  return folders.hasNext() ? folders.next() : parentFolder.createFolder(name);
}

function upsertTextFile_(folder, name, content, mimeType) {
  const files = folder.getFilesByName(name);
  if (files.hasNext()) {
    const file = files.next();
    file.setContent(content);
    return file;
  }
  return folder.createFile(name, content, mimeType);
}

function parsePayload_(e) {
  const directPayload = e && e.parameter && e.parameter.payload;
  if (directPayload) return JSON.parse(directPayload);
  const body = e && e.postData && e.postData.contents;
  return body ? JSON.parse(body) : {};
}

function jsonResponse_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function cleanName_(value) {
  return String(value || "")
    .trim()
    .replace(/[\\/:*?"<>|#%{}~&]/g, "-")
    .replace(/\s+/g, " ")
    .slice(0, 120);
}

function fileHeaders_() {
  return [
    "Updated At",
    "File No.",
    "Client",
    "Phone",
    "Email",
    "Address",
    "Lead Source",
    "Project Type",
    "File Status",
    "Status Detail",
    "Estimate Amount",
    "Materials",
    "1st Deposit",
    "2nd Deposit",
    "Final Payment",
    "Paid In Full",
    "Next Action",
    "Next Action Date",
    "Drive Folder",
  ];
}

function fileRow_(file, folderUrl) {
  return [
    new Date(),
    file.fileNumber || "",
    file.clientName || "",
    file.clientPhone || "",
    file.clientEmail || "",
    file.projectAddress || "",
    file.leadSource || "",
    file.projectType || "",
    file.fileStatus || "",
    file.statusDetail || "",
    Number(file.estimateTotal) || 0,
    Number(file.materialTotal) || 0,
    Number(file.initialDeposit) || 0,
    Number(file.midpointDeposit) || 0,
    Number(file.finalPaymentAmount) || 0,
    file.paidInFull || "",
    file.nextAction || "",
    file.nextActionDate || "",
    folderUrl || "",
  ];
}

function revenueHeaders_() {
  return ["Updated At", "Date", "Client / Job", "Gross", "Expenses", "Labor", "Profit", "Receipt Notes", "Labor Assigns", "Dashboard File ID"];
}

function revenueRow_(row) {
  const gross = Number(row.gross) || 0;
  const expenses = Number(row.expenses) || 0;
  const labor = Number(row.labor) || 0;
  return [
    new Date(),
    row.date || "",
    row.clientJob || "",
    gross,
    expenses,
    labor,
    Number(row.profit) || gross - expenses - labor,
    row.receiptNotes || "",
    row.laborAssigns || "",
    row.dashboardFileId || "",
  ];
}

function priceHeaders_() {
  return ["Updated At", "Product", "Price", "Unit", "Category", "Vendor", "Source", "Source ID"];
}

function priceRow_(row) {
  return [
    new Date(),
    row.name || row.product || "",
    Number(row.defaultPrice || row.price) || 0,
    row.unit || "",
    row.category || "",
    row.vendor || "",
    row.source || "",
    row.sourceId || row.id || "",
  ];
}

function submissionHeaders_() {
  return ["Updated At", "File No.", "Client", "Phone", "Email", "Address", "Project Type", "Estimate Total", "Material Cost", "Submitted At", "Drive Folder"];
}

function submissionRow_(payload, folderUrl) {
  const totals = payload.totals || {};
  const backend = payload.backend || {};
  return [
    new Date(),
    payload.estimateNumber || "",
    payload.clientName || "",
    payload.clientPhone || "",
    payload.clientEmail || "",
    payload.projectAddress || "",
    payload.projectType || "",
    Number(totals.total) || 0,
    Number(backend.estimatedMaterialCost) || 0,
    payload.submittedAt || "",
    folderUrl || "",
  ];
}
