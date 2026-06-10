const DRIVE_PARENT_FOLDER_ID = "1SjVGZKYbdWzWqbbZ7zJ3mx1jNLtBi_4r";
const SHEET_NAME = "D2 Estimate Archive";

function doPost(e) {
  const payload = JSON.parse((e.parameter && e.parameter.payload) || "{}");
  const parentFolder = DriveApp.getFolderById(DRIVE_PARENT_FOLDER_ID);
  const sheet = getOrCreateArchiveSheet_(parentFolder);
  const estimateNumber = cleanName_(payload.estimateNumber || `EST-${Date.now()}`);
  const clientName = cleanName_(payload.clientName || "Unnamed Client");
  const folderName = `${clientName} - ${estimateNumber}`;
  const jobFolder = getOrCreateChildFolder_(parentFolder, folderName);
  const copies = payload.copies || {};
  const total = Number(payload.totals && payload.totals.total) || 0;
  const materialCost = Number(payload.backend && payload.backend.estimatedMaterialCost) || 0;
  const grossProfit = Number(payload.backend && payload.backend.estimatedGrossProfit) || 0;

  jobFolder.createFile(
    `${folderName} - estimate-data.json`,
    JSON.stringify(payload, null, 2),
    MimeType.PLAIN_TEXT
  );

  Object.keys(copies).forEach((key) => {
    const copy = copies[key] || {};
    const label = cleanName_(copy.label || key);
    if (!copy.html) return;
    jobFolder.createFile(`${folderName} - ${label}.html`, copy.html, MimeType.HTML);
  });

  sheet.appendRow([
    new Date(),
    estimateNumber,
    clientName,
    payload.clientPhone || "",
    payload.clientEmail || "",
    payload.projectAddress || "",
    payload.projectType || "",
    total,
    materialCost,
    grossProfit,
    payload.notes || "",
    jobFolder.getUrl(),
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, estimateNumber, folderUrl: jobFolder.getUrl() }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return ContentService
    .createTextOutput("D2 Estimate Archive is connected.")
    .setMimeType(ContentService.MimeType.TEXT);
}

function getOrCreateChildFolder_(parentFolder, name) {
  const folders = parentFolder.getFoldersByName(name);
  return folders.hasNext() ? folders.next() : parentFolder.createFolder(name);
}

function getOrCreateArchiveSheet_(parentFolder) {
  const files = parentFolder.getFilesByName(SHEET_NAME);
  if (files.hasNext()) {
    return SpreadsheetApp.open(files.next()).getSheets()[0];
  }

  const spreadsheet = SpreadsheetApp.create(SHEET_NAME);
  const file = DriveApp.getFileById(spreadsheet.getId());
  parentFolder.addFile(file);
  DriveApp.getRootFolder().removeFile(file);

  const sheet = spreadsheet.getSheets()[0];
  sheet.appendRow([
    "Submitted At",
    "Estimate No.",
    "Client",
    "Phone",
    "Email",
    "Address",
    "Project Type",
    "Estimate Total",
    "Material Cost",
    "Projected Gross",
    "Notes",
    "Drive Folder",
  ]);
  return sheet;
}

function cleanName_(value) {
  return String(value || "")
    .trim()
    .replace(/[\\/:*?"<>|#%{}~&]/g, "-")
    .replace(/\s+/g, " ")
    .slice(0, 120);
}
