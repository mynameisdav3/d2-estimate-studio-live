const DRIVE_PARENT_FOLDER_ID = "1SjVGZKYbdWzWqbbZ7zJ3mx1jNLtBi_4r";
const CRM_SHEET_NAME = "D2 CRM Database";

function doPost(e) {
  const payload = parsePayload_(e);
  const parentFolder = DriveApp.getFolderById(DRIVE_PARENT_FOLDER_ID);
  const sheet = getOrCreateCrmSheet_(parentFolder);

  const fileNumber = cleanName_(payload.estimateNumber || `D2-${Date.now()}`);
  const clientName = cleanName_(payload.clientName || "Unnamed Client");
  const folderName = `${fileNumber} - ${clientName}`;
  const customerFolder = getOrCreateChildFolder_(parentFolder, folderName);
  createStandardSubfolders_(customerFolder);

  customerFolder.createFile(
    `${folderName} - editable-data.json`,
    JSON.stringify(payload, null, 2),
    MimeType.PLAIN_TEXT
  );

  const copies = payload.copies || {};
  Object.keys(copies).forEach((key) => {
    const copy = copies[key] || {};
    const label = cleanName_(copy.label || key);
    if (!copy.html) return;
    customerFolder.createFile(`${folderName} - ${label}.html`, copy.html, MimeType.HTML);
  });

  const totals = payload.totals || {};
  const backend = payload.backend || {};
  const row = [
    new Date(),
    fileNumber,
    clientName,
    payload.clientPhone || "",
    payload.clientEmail || "",
    payload.projectAddress || "",
    payload.leadSource || "Manual",
    payload.projectType || "",
    payload.fileStatus || "New Lead",
    payload.contactStatus || "Pending",
    payload.customerTemperature || "Warm",
    payload.estimateStatus || "Pending",
    payload.inspectionDate || "",
    payload.inspectionTime || "",
    payload.assignmentStartDate || "",
    payload.assignmentArrivalTime || "",
    payload.warrantyStatus || "Not Sent",
    payload.nextActionDate || "",
    payload.nextAction || "",
    Number(totals.total) || 0,
    Number(backend.estimatedMaterialCost) || 0,
    Number(backend.estimatedGrossProfit) || 0,
    payload.notes || "",
    customerFolder.getUrl(),
  ];

  upsertCrmRow_(sheet, fileNumber, row);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, fileNumber, folderUrl: customerFolder.getUrl() }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return ContentService
    .createTextOutput("D2 CRM backend is connected.")
    .setMimeType(ContentService.MimeType.TEXT);
}

function parsePayload_(e) {
  const directPayload = e && e.parameter && e.parameter.payload;
  if (directPayload) return JSON.parse(directPayload);
  const body = e && e.postData && e.postData.contents;
  return body ? JSON.parse(body) : {};
}

function getOrCreateCrmSheet_(parentFolder) {
  const files = parentFolder.getFilesByName(CRM_SHEET_NAME);
  if (files.hasNext()) {
    const spreadsheet = SpreadsheetApp.open(files.next());
    const sheet = spreadsheet.getSheets()[0];
    ensureHeader_(sheet);
    return sheet;
  }

  const spreadsheet = SpreadsheetApp.create(CRM_SHEET_NAME);
  const file = DriveApp.getFileById(spreadsheet.getId());
  parentFolder.addFile(file);
  DriveApp.getRootFolder().removeFile(file);

  const sheet = spreadsheet.getSheets()[0];
  ensureHeader_(sheet);
  return sheet;
}

function ensureHeader_(sheet) {
  const headers = [
    "Updated At",
    "File No.",
    "Client",
    "Phone",
    "Email",
    "Address",
    "Lead Source",
    "Project Type",
    "File Status",
    "Contact Status",
    "Customer Temperature",
    "Estimate Status",
    "Inspection Date",
    "Inspection Time",
    "Start Date",
    "Arrival Window",
    "Warranty Status",
    "Next Action Date",
    "Next Action",
    "Estimate Total",
    "Material Cost",
    "Projected Gross",
    "Notes",
    "Drive Folder",
  ];

  const firstRow = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  const hasHeader = firstRow.some((value) => String(value || "").trim());
  if (!hasHeader) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
    return;
  }

  headers.forEach((header, index) => {
    if (!firstRow[index]) sheet.getRange(1, index + 1).setValue(header);
  });
}

function upsertCrmRow_(sheet, fileNumber, row) {
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    const fileNumbers = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
    for (let index = 0; index < fileNumbers.length; index += 1) {
      if (String(fileNumbers[index][0]) === String(fileNumber)) {
        sheet.getRange(index + 2, 1, 1, row.length).setValues([row]);
        return;
      }
    }
  }
  sheet.appendRow(row);
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

function cleanName_(value) {
  return String(value || "")
    .trim()
    .replace(/[\\/:*?"<>|#%{}~&]/g, "-")
    .replace(/\s+/g, " ")
    .slice(0, 120);
}
