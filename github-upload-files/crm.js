const crmCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const CRM_STORAGE_KEY = "d2CrmDemoFiles";
const CRM_REVENUE_STORAGE_KEY = "d2CrmRevenueRows";

const crmFields = [
  "clientName",
  "clientPhone",
  "clientEmail",
  "projectAddress",
  "leadSource",
  "fileStatus",
  "contactStatus",
  "customerTemperature",
  "projectType",
  "projectStage",
  "inspectionDate",
  "inspectionTime",
  "startDate",
  "arrivalWindow",
  "nextAction",
  "nextActionDate",
  "warrantyStatus",
  "leadValue",
  "estimateStatus",
  "invoiceStatus",
  "reviewStatus",
  "lossReason",
];

const trackedStatusFields = {
  fileStatus: "File status",
  contactStatus: "Contact status",
  projectStage: "Project stage",
  estimateStatus: "Estimate status",
  invoiceStatus: "Invoice status",
  reviewStatus: "Review status",
};

const $ = (id) => document.getElementById(id);

let crmFiles = loadCrmFiles();
let activeFileId = crmFiles[0] ? crmFiles[0].id : null;
let crmRevenueRows = loadRevenueRows();
let activeRevenueId = crmRevenueRows[0] ? crmRevenueRows[0].id : null;

function todayIso(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}

function makeCrmFileNumber() {
  const date = new Date();
  const year = String(date.getFullYear()).slice(2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const count = crmFiles.filter((file) => String(file.fileNumber || "").includes(`D2-${year}${month}${day}`)).length + 1;
  return `D2-${year}${month}${day}-${String(count).padStart(3, "0")}`;
}

function defaultFiles() {
  return [
    {
      id: "demo-1",
      fileNumber: "D2-260614-001",
      clientName: "Sample Angi Lead",
      clientPhone: "239-555-0188",
      clientEmail: "sample@email.com",
      projectAddress: "Cape Coral, FL",
      leadSource: "Angi",
      fileStatus: "Contact Pending",
      contactStatus: "Pending",
      customerTemperature: "Warm",
      projectType: "Closet",
      projectStage: "Lead",
      inspectionDate: todayIso(1),
      inspectionTime: "09:00",
      startDate: "",
      arrivalWindow: "Open",
      nextAction: "Call and schedule inspection",
      nextActionDate: todayIso(1),
      warrantyStatus: "Not Sent",
      leadValue: 0,
      estimateStatus: "Not Started",
      invoiceStatus: "Not Created",
      reviewStatus: "Not Ready",
      lossReason: "",
      estimateTotal: 0,
      depositTotal: 0,
      materialTotal: 0,
      notes: [{ at: new Date().toISOString(), text: "New lead waiting for first contact." }],
      timeline: ["Lead received", "Customer auto-reply queued"],
    },
    {
      id: "demo-2",
      fileNumber: "D2-260613-004",
      clientName: "Approved Cabinet Job",
      clientPhone: "239-555-0142",
      clientEmail: "approved@email.com",
      projectAddress: "Fort Myers, FL",
      leadSource: "Referral",
      fileStatus: "Start Date Set",
      contactStatus: "Established",
      customerTemperature: "Hot",
      projectType: "Cabinetry",
      projectStage: "Scheduled",
      inspectionDate: todayIso(-2),
      inspectionTime: "10:00",
      startDate: todayIso(1),
      arrivalWindow: "8:00 AM",
      nextAction: "Send warranty details and start-date congratulations",
      nextActionDate: todayIso(1),
      warrantyStatus: "Ready to Send",
      leadValue: 4782,
      estimateStatus: "Approved",
      invoiceStatus: "Deposit Paid",
      reviewStatus: "Not Ready",
      lossReason: "",
      estimateTotal: 4782,
      depositTotal: 2391,
      materialTotal: 1120,
      notes: [{ at: new Date().toISOString(), text: "Customer approved. Needs warranty email and team assignment." }],
      timeline: ["Estimate sent", "Customer approved", "Start date selected"],
    },
  ];
}

function defaultRevenueRows() {
  if (Array.isArray(window.D2_REVENUE_ROWS)) {
    return window.D2_REVENUE_ROWS.map((row) => ({ ...row }));
  }
  return [
    {
      id: "rev-visible-1",
      date: "2026-03-25",
      clientJob: "Liz-Misc",
      gross: 100,
      expenses: 0,
      labor: 0,
      profit: 100,
      receiptNotes: "",
      laborAssigns: "",
    },
    {
      id: "rev-visible-2",
      date: "2026-03-25",
      clientJob: "David Neville - Drywall",
      gross: 50,
      expenses: 0,
      labor: 0,
      profit: 50,
      receiptNotes: "",
      laborAssigns: "",
    },
    {
      id: "rev-visible-3",
      date: "2026-03-26",
      clientJob: "Brian-Misc",
      gross: 450,
      expenses: 0,
      labor: 0,
      profit: 450,
      receiptNotes: "",
      laborAssigns: "",
    },
    {
      id: "rev-visible-4",
      date: "2026-04-07",
      clientJob: "Donna - Slide Outs",
      gross: 2990,
      expenses: 990,
      labor: 0,
      profit: 2000,
      receiptNotes: "",
      laborAssigns: "",
    },
    {
      id: "rev-visible-5",
      date: "2026-04-25",
      clientJob: "Bob-Planks",
      gross: 2290,
      expenses: 290,
      labor: 0,
      profit: 2000,
      receiptNotes: "",
      laborAssigns: "",
    },
    {
      id: "rev-visible-6",
      date: "2026-05-05",
      clientJob: "Jake - Fascia Board",
      gross: 596,
      expenses: 0,
      labor: 0,
      profit: 596,
      receiptNotes: "",
      laborAssigns: "",
    },
    {
      id: "rev-visible-7",
      date: "2026-05-08",
      clientJob: "Jake - Fascia Board",
      gross: 350,
      expenses: 0,
      labor: 0,
      profit: 350,
      receiptNotes: "",
      laborAssigns: "",
    },
    {
      id: "rev-visible-8",
      date: "2026-05-18",
      clientJob: "Jim Goodman-Cabinet Staining",
      gross: 600,
      expenses: 282.33,
      labor: 0,
      profit: 317.67,
      receiptNotes: "Home Depot $70.74",
      laborAssigns: "",
    },
    {
      id: "rev-visible-9",
      date: "2026-05-25",
      clientJob: "Laurie - Concrete Counters",
      gross: 3162,
      expenses: 393.72,
      labor: 1000,
      profit: 1768.28,
      receiptNotes: "SW: $18.09",
      laborAssigns: "Nesto",
    },
    {
      id: "rev-visible-10",
      date: "2026-06-01",
      clientJob: "Deb-Fan and Lights",
      gross: 542,
      expenses: 272.04,
      labor: 0,
      profit: 269.96,
      receiptNotes: "",
      laborAssigns: "",
    },
    {
      id: "rev-visible-11",
      date: "2026-06-11",
      clientJob: "Ana - Abi Closet",
      gross: 1850,
      expenses: 573.62,
      labor: 0,
      profit: 1276.38,
      receiptNotes: "IMECA-$237.96 + 72.85",
      laborAssigns: "",
    },
  ];
}

function loadCrmFiles() {
  try {
    const saved = localStorage.getItem(CRM_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (error) {
    // Local demo storage may be unavailable in some browsers.
  }
  return defaultFiles();
}

function loadRevenueRows() {
  const spreadsheetRows = defaultRevenueRows();
  try {
    const saved = localStorage.getItem(CRM_REVENUE_STORAGE_KEY);
    if (saved) {
      const rows = JSON.parse(saved);
      if (Array.isArray(rows)) {
        if (Array.isArray(window.D2_REVENUE_ROWS) && rows.length < spreadsheetRows.length) {
          return spreadsheetRows;
        }
        return rows;
      }
    }
  } catch (error) {
    // Local demo storage may be unavailable in some browsers.
  }
  return spreadsheetRows;
}

function saveCrmFiles() {
  try {
    localStorage.setItem(CRM_STORAGE_KEY, JSON.stringify(crmFiles));
  } catch (error) {
    // Google Drive will become the real storage layer.
  }
}

function saveRevenueRows() {
  try {
    localStorage.setItem(CRM_REVENUE_STORAGE_KEY, JSON.stringify(crmRevenueRows));
  } catch (error) {
    // Google Drive will become the real storage layer.
  }
}

function activeFile() {
  return crmFiles.find((file) => file.id === activeFileId) || null;
}

function normalizeCrmFile(file) {
  if (!file) return file;
  if (!Array.isArray(file.notes)) file.notes = [];
  if (!Array.isArray(file.timeline)) file.timeline = [];
  file.projectStage = file.projectStage || inferProjectStage(file.fileStatus);
  file.estimateStatus = file.estimateStatus || inferEstimateStatus(file.fileStatus);
  file.invoiceStatus = file.invoiceStatus || (file.fileStatus === "Paid" ? "Paid" : "Not Created");
  file.reviewStatus = file.reviewStatus || (file.fileStatus === "Review Requested" ? "Requested" : "Not Ready");
  file.leadValue = file.leadValue || file.estimateTotal || 0;
  file.lossReason = file.lossReason || "";
  if (file.fileNotes && !file.notes.length) {
    file.notes.push({ at: new Date().toISOString(), text: file.fileNotes });
    file.fileNotes = "";
  }
  return file;
}

function inferProjectStage(status = "") {
  if (["Approved", "Start Date Set", "Job Scheduled"].includes(status)) return "Scheduled";
  if (status === "In Progress") return "In Progress";
  if (status === "Completed") return "Completed";
  if (status === "Paid") return "Paid";
  if (status === "Review Requested") return "Review";
  if (status === "Inspection Scheduled") return "Inspection";
  if (["Estimate Pending", "Estimate Completed", "Estimate Sent"].includes(status)) return "Estimate";
  if (["Closed", "Dead Lead", "Archived"].includes(status)) return "Closed";
  return "Lead";
}

function inferEstimateStatus(status = "") {
  if (status === "Estimate Pending") return "Pending";
  if (status === "Estimate Completed") return "Completed";
  if (status === "Estimate Sent") return "Sent";
  if (["Approved", "Start Date Set", "Job Scheduled", "In Progress", "Completed", "Paid"].includes(status)) return "Approved";
  if (status === "Dead Lead") return "Declined";
  return "Not Started";
}

function visibleFiles() {
  const filter = $("crmFileFilter").value;
  if (filter === "all") return crmFiles;
  if (filter === "tomorrow") {
    const tomorrow = todayIso(1);
    return crmFiles.filter((file) => file.nextActionDate === tomorrow || file.inspectionDate === tomorrow || file.startDate === tomorrow);
  }
  if (filter === "new") return crmFiles.filter((file) => file.fileStatus === "New Lead" || file.fileStatus === "Contact Pending");
  if (filter === "estimate") return crmFiles.filter((file) => ["Estimate Pending", "Estimate Completed", "Estimate Sent"].includes(file.fileStatus));
  if (filter === "inspection") return crmFiles.filter((file) => file.fileStatus === "Inspection Scheduled" || file.projectStage === "Inspection" || Boolean(file.inspectionDate));
  if (filter === "won") return crmFiles.filter((file) => ["Approved", "Start Date Set", "Job Scheduled", "In Progress"].includes(file.fileStatus));
  if (filter === "active") return crmFiles.filter((file) => ["Scheduled", "In Progress"].includes(file.projectStage) || ["Start Date Set", "Job Scheduled", "In Progress"].includes(file.fileStatus));
  if (filter === "review") return crmFiles.filter((file) => ["Ready to Request", "Requested"].includes(file.reviewStatus) || file.fileStatus === "Review Requested");
  if (filter === "archive") return crmFiles.filter((file) => file.fileStatus === "Archived" || file.fileStatus === "Dead Lead");
  return crmFiles;
}

function renderCounts() {
  const tomorrow = todayIso(1);
  $("tomorrowCount").textContent = crmFiles.filter((file) => file.nextActionDate === tomorrow || file.inspectionDate === tomorrow || file.startDate === tomorrow).length;
  $("newLeadCount").textContent = crmFiles.filter((file) => file.fileStatus === "New Lead" || file.fileStatus === "Contact Pending").length;
  $("pendingEstimateCount").textContent = crmFiles.filter((file) => ["Estimate Pending", "Estimate Completed", "Estimate Sent"].includes(file.fileStatus)).length;
  $("inspectionCount").textContent = crmFiles.filter((file) => file.fileStatus === "Inspection Scheduled" || file.projectStage === "Inspection" || Boolean(file.inspectionDate)).length;
  $("wonJobCount").textContent = crmFiles.filter((file) => ["Approved", "Start Date Set", "Job Scheduled", "In Progress"].includes(file.fileStatus)).length;
  $("activeJobCount").textContent = crmFiles.filter((file) => ["Scheduled", "In Progress"].includes(file.projectStage) || ["Start Date Set", "Job Scheduled", "In Progress"].includes(file.fileStatus)).length;
  $("reviewCount").textContent = crmFiles.filter((file) => ["Ready to Request", "Requested"].includes(file.reviewStatus) || file.fileStatus === "Review Requested").length;
}

function renderFileList() {
  const files = visibleFiles();
  $("crmListTitle").textContent = $("crmFileFilter").selectedOptions[0].textContent;
  $("crmFileList").innerHTML = files.map((file) => `
    <button type="button" class="crm-file-card ${file.id === activeFileId ? "active" : ""}" data-file-id="${file.id}">
      <span>${escapeHtml(file.fileNumber)}</span>
      <strong>${escapeHtml(file.clientName || "Unnamed Client")}</strong>
      <small>${escapeHtml(file.fileStatus)} · ${escapeHtml(file.projectType)} · ${escapeHtml(file.estimateStatus || "Not Started")}</small>
      <em>${escapeHtml(file.nextAction || "No next action set")}</em>
    </button>
  `).join("") || `<p class="crm-empty-state">No files in this view yet.</p>`;

  document.querySelectorAll("[data-file-id]").forEach((button) => {
    button.addEventListener("click", () => {
      saveActiveFile();
      activeFileId = button.dataset.fileId;
      renderCrm();
    });
  });
}

function renderActiveFile() {
  const file = normalizeCrmFile(activeFile());
  if (!file) {
    $("activeFileNumber").textContent = "No file selected";
    $("activeClientName").textContent = "Create or select a customer file";
    crmFields.forEach((field) => {
      const element = $(`crm${field[0].toUpperCase()}${field.slice(1)}`);
      if (element) element.value = "";
    });
    $("crmEstimateTotal").textContent = crmCurrency.format(0);
    $("crmDepositTotal").textContent = crmCurrency.format(0);
    $("crmMaterialTotal").textContent = crmCurrency.format(0);
    $("crmBalanceTotal").textContent = crmCurrency.format(0);
    $("crmLeadValueTotal").textContent = crmCurrency.format(0);
    $("crmNewNote").value = "";
    $("crmNoteList").innerHTML = `<p class="crm-empty-state">No file selected.</p>`;
    $("crmTimeline").innerHTML = "<p>No timeline activity yet.</p>";
    return;
  }
  $("activeFileNumber").textContent = file.fileNumber;
  $("activeClientName").textContent = file.clientName || "Unnamed Client";
  crmFields.forEach((field) => {
    const element = $(`crm${field[0].toUpperCase()}${field.slice(1)}`);
    if (element) element.value = file[field] || "";
  });
  $("crmEstimateTotal").textContent = crmCurrency.format(Number(file.estimateTotal) || 0);
  $("crmDepositTotal").textContent = crmCurrency.format(Number(file.depositTotal) || 0);
  $("crmMaterialTotal").textContent = crmCurrency.format(Number(file.materialTotal) || 0);
  $("crmBalanceTotal").textContent = crmCurrency.format(Math.max((Number(file.estimateTotal) || 0) - (Number(file.depositTotal) || 0), 0));
  $("crmLeadValueTotal").textContent = crmCurrency.format(Number(file.leadValue) || 0);
  $("crmNewNote").value = "";
  renderNotes(file);
  $("crmTimeline").innerHTML = (file.timeline || []).map((entry) => `<div>${escapeHtml(entry)}</div>`).join("") || "<p>No timeline activity yet.</p>";
}

function saveActiveFile() {
  const file = normalizeCrmFile(activeFile());
  if (!file) return;
  crmFields.forEach((field) => {
    const element = $(`crm${field[0].toUpperCase()}${field.slice(1)}`);
    if (!element) return;
    const oldValue = file[field] || "";
    const newValue = element.value;
    file[field] = newValue;
    if (trackedStatusFields[field] && oldValue && oldValue !== newValue) {
      file.timeline.push(`${trackedStatusFields[field]} changed from ${oldValue} to ${newValue} on ${formatNoteTimestamp(new Date().toISOString())}`);
    }
  });
  if (!file.timeline) file.timeline = [];
  saveCrmFiles();
}

function formatNoteTimestamp(value) {
  const date = value ? new Date(value) : new Date();
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function renderNotes(file) {
  const notes = Array.isArray(file.notes) ? file.notes : [];
  $("crmNoteList").innerHTML = notes.length
    ? notes
        .slice()
        .reverse()
        .map((note) => `
          <article class="crm-note-entry">
            <time>${escapeHtml(formatNoteTimestamp(note.at))}</time>
            <p>${escapeHtml(note.text)}</p>
          </article>
        `)
        .join("")
    : `<p class="crm-empty-state">No notes yet. Add the first note above.</p>`;
}

function addCrmNote() {
  const file = normalizeCrmFile(activeFile());
  if (!file) return;
  const text = $("crmNewNote").value.trim();
  if (!text) return;
  const timestamp = new Date().toISOString();
  file.notes.push({ at: timestamp, text });
  file.timeline = [...(file.timeline || []), `Note added ${formatNoteTimestamp(timestamp)}`];
  $("crmNewNote").value = "";
  saveCrmFiles();
  renderCrm();
}

function newCrmFile() {
  saveActiveFile();
  const file = {
    id: `file-${Date.now()}`,
    fileNumber: makeCrmFileNumber(),
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    projectAddress: "",
    leadSource: "Manual",
    fileStatus: "New Lead",
    contactStatus: "Pending",
    customerTemperature: "Warm",
    projectType: "Other",
    projectStage: "Lead",
    inspectionDate: "",
    inspectionTime: "",
    startDate: "",
    arrivalWindow: "Open",
    nextAction: "Contact customer",
    nextActionDate: todayIso(1),
    warrantyStatus: "Not Sent",
    leadValue: 0,
    estimateStatus: "Not Started",
    invoiceStatus: "Not Created",
    reviewStatus: "Not Ready",
    lossReason: "",
    estimateTotal: 0,
    depositTotal: 0,
    materialTotal: 0,
    notes: [],
    timeline: ["File created"],
  };
  crmFiles.unshift(file);
  activeFileId = file.id;
  saveCrmFiles();
  renderCrm();
}

function deleteActiveFile() {
  const file = activeFile();
  if (!file) {
    window.alert("Select a file before deleting.");
    return;
  }

  const passcode = window.prompt(`Enter the delete passcode for ${file.fileNumber}.`);
  if (passcode === null) return;
  if (passcode !== "1111") {
    window.alert("Incorrect passcode. File was not deleted.");
    return;
  }

  const confirmed = window.confirm(`Delete ${file.fileNumber} - ${file.clientName || "Unnamed Client"}? This removes it from this dashboard list.`);
  if (!confirmed) return;

  const deleteIndex = crmFiles.findIndex((entry) => entry.id === file.id);
  crmFiles = crmFiles.filter((entry) => entry.id !== file.id);
  const nextFile = crmFiles[deleteIndex] || crmFiles[deleteIndex - 1] || crmFiles[0] || null;
  activeFileId = nextFile ? nextFile.id : null;
  saveCrmFiles();
  renderCrm();
}

function renderCrm() {
  renderCounts();
  renderFileList();
  renderActiveFile();
  renderRevenue();
}

function parseMoney(value) {
  const cleaned = String(value || "").replace(/[$,]/g, "").trim();
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeDate(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  const date = new Date(text);
  if (!Number.isNaN(date.getTime())) return date.toISOString().slice(0, 10);
  return text;
}

function displayDate(value) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function revenueTotals() {
  return crmRevenueRows.reduce(
    (totals, row) => {
      totals.gross += Number(row.gross) || 0;
      totals.expenses += Number(row.expenses) || 0;
      totals.labor += Number(row.labor) || 0;
      totals.profit += Number(row.profit) || ((Number(row.gross) || 0) - (Number(row.expenses) || 0) - (Number(row.labor) || 0));
      return totals;
    },
    { gross: 0, expenses: 0, labor: 0, profit: 0 },
  );
}

function findFileForRevenue(row) {
  const needle = String(row.clientJob || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!needle) return null;
  return crmFiles.find((file) => {
    const haystack = `${file.clientName || ""} ${file.projectAddress || ""}`.toLowerCase().replace(/[^a-z0-9]/g, "");
    return haystack && (needle.includes(haystack) || haystack.includes(needle.slice(0, Math.min(needle.length, 10))));
  }) || null;
}

function renderRevenue() {
  const totals = revenueTotals();
  $("crmRevenueGross").textContent = crmCurrency.format(totals.gross);
  $("crmRevenueExpenses").textContent = crmCurrency.format(totals.expenses);
  $("crmRevenueLabor").textContent = crmCurrency.format(totals.labor);
  $("crmRevenueProfit").textContent = crmCurrency.format(totals.profit);

  $("crmRevenueRows").innerHTML = crmRevenueRows
    .map((row) => {
      const file = findFileForRevenue(row);
      return `
        <tr class="${row.id === activeRevenueId ? "active" : ""}">
          <td>${escapeHtml(displayDate(row.date))}</td>
          <td>
            <strong>${escapeHtml(row.clientJob || "Unnamed Job")}</strong>
            ${file ? `<small>${escapeHtml(file.fileNumber)}</small>` : ""}
          </td>
          <td>${crmCurrency.format(Number(row.gross) || 0)}</td>
          <td>${crmCurrency.format(Number(row.expenses) || 0)}</td>
          <td>${crmCurrency.format(Number(row.labor) || 0)}</td>
          <td>${crmCurrency.format(Number(row.profit) || 0)}</td>
          <td>${escapeHtml(row.receiptNotes || "")}</td>
          <td>${escapeHtml(row.laborAssigns || "")}</td>
          <td><button type="button" data-revenue-id="${escapeHtml(row.id)}">View</button></td>
        </tr>
      `;
    })
    .join("");

  document.querySelectorAll("[data-revenue-id]").forEach((button) => {
    button.addEventListener("click", () => {
      activeRevenueId = button.dataset.revenueId;
      renderRevenue();
    });
  });
  renderExpenseDetail();
}

function renderExpenseDetail() {
  const row = crmRevenueRows.find((entry) => entry.id === activeRevenueId) || crmRevenueRows[0];
  if (!row) {
    $("crmExpenseDetail").innerHTML = `<p class="crm-empty-state">Select a revenue row to see expense details.</p>`;
    return;
  }
  const file = findFileForRevenue(row);
  $("crmExpenseDetail").innerHTML = `
    <p class="eyebrow">${escapeHtml(row.date || "No date")}</p>
    <h3>${escapeHtml(row.clientJob || "Unnamed Job")}</h3>
    <dl>
      <div><dt>Gross</dt><dd>${crmCurrency.format(Number(row.gross) || 0)}</dd></div>
      <div><dt>Expenses</dt><dd>${crmCurrency.format(Number(row.expenses) || 0)}</dd></div>
      <div><dt>Labor</dt><dd>${crmCurrency.format(Number(row.labor) || 0)}</dd></div>
      <div><dt>Profit</dt><dd>${crmCurrency.format(Number(row.profit) || 0)}</dd></div>
    </dl>
    <p><strong>Receipt Notes</strong><br>${escapeHtml(row.receiptNotes || "No receipt notes added.")}</p>
    <p><strong>Labor Assigns</strong><br>${escapeHtml(row.laborAssigns || "No labor assignment added.")}</p>
    ${file ? `<button type="button" class="icon-button" id="crmOpenRevenueFile">Open Customer File</button>` : `<p class="crm-empty-state">No matching customer file linked yet.</p>`}
  `;
  const openButton = $("crmOpenRevenueFile");
  if (openButton && file) {
    openButton.addEventListener("click", () => {
      activeFileId = file.id;
      switchCrmView("dashboard");
      renderCrm();
    });
  }
}

function parseRevenueImport(text) {
  return String(text || "")
    .split(/\r?\n/)
    .map((line) => line.split("\t"))
    .filter((cells) => cells.some((cell) => String(cell || "").trim()))
    .filter((cells) => !/^date$/i.test(String(cells[0] || "").trim()))
    .map((cells, index) => {
      const gross = parseMoney(cells[2]);
      const expenses = parseMoney(cells[3]);
      const labor = parseMoney(cells[4]);
      const profit = cells[5] === undefined || cells[5] === "" ? gross - expenses - labor : parseMoney(cells[5]);
      return {
        id: `rev-import-${Date.now()}-${index}`,
        date: normalizeDate(cells[0]),
        clientJob: String(cells[1] || "").trim(),
        gross,
        expenses,
        labor,
        profit,
        receiptNotes: String(cells[6] || "").trim(),
        laborAssigns: String(cells[7] || "").trim(),
      };
    })
    .filter((row) => row.clientJob || row.gross || row.expenses || row.labor);
}

function importRevenueRows() {
  const rows = parseRevenueImport($("crmRevenueImport").value);
  if (!rows.length) {
    window.alert("Paste revenue rows from Google Sheets first.");
    return;
  }
  crmRevenueRows = rows;
  activeRevenueId = rows[0].id;
  $("crmRevenueImport").value = "";
  saveRevenueRows();
  renderRevenue();
}

function addRevenueRow() {
  const clientJob = window.prompt("Client / job name");
  if (!clientJob) return;
  const gross = parseMoney(window.prompt("Amount charged"));
  const expenses = parseMoney(window.prompt("Expenses"));
  const labor = parseMoney(window.prompt("Labor"));
  const row = {
    id: `rev-${Date.now()}`,
    date: todayIso(0),
    clientJob,
    gross,
    expenses,
    labor,
    profit: gross - expenses - labor,
    receiptNotes: "",
    laborAssigns: "",
  };
  crmRevenueRows.unshift(row);
  activeRevenueId = row.id;
  saveRevenueRows();
  renderRevenue();
}

function switchCrmView(view) {
  const showRevenue = view === "revenue";
  document.querySelectorAll(".crm-dashboard-view").forEach((section) => {
    section.hidden = showRevenue;
  });
  $("crmRevenueView").hidden = !showRevenue;
  document.querySelectorAll("[data-crm-view]").forEach((button) => {
    button.classList.toggle("active", button.dataset.crmView === view);
  });
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

document.querySelectorAll("[data-crm-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-crm-filter]").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    $("crmFileFilter").value = button.dataset.crmFilter;
    renderCrm();
  });
});

$("crmFileFilter").addEventListener("change", renderCrm);
$("crmNewFile").addEventListener("click", newCrmFile);
$("crmAddNote").addEventListener("click", addCrmNote);
$("crmNewNote").addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
    event.preventDefault();
    addCrmNote();
  }
});
$("crmSaveDemo").addEventListener("click", () => {
  saveActiveFile();
  renderCrm();
});
$("crmArchiveFile").addEventListener("click", () => {
  const file = activeFile();
  if (!file) return;
  file.fileStatus = "Archived";
  file.timeline = [...(file.timeline || []), "File archived"];
  saveCrmFiles();
  renderCrm();
});
$("crmDeleteFile").addEventListener("click", deleteActiveFile);
$("crmOpenEstimate").addEventListener("click", () => window.open("index.html", "_blank", "noopener"));
$("crmOpenAssignment").addEventListener("click", () => window.open("index.html#assignment", "_blank", "noopener"));
$("crmImportRevenue").addEventListener("click", importRevenueRows);
$("crmAddRevenueRow").addEventListener("click", addRevenueRow);
document.querySelectorAll("[data-crm-view]").forEach((button) => {
  button.addEventListener("click", () => switchCrmView(button.dataset.crmView));
});

document.querySelectorAll("input, select, textarea").forEach((element) => {
  element.addEventListener("change", saveActiveFile);
});

switchCrmView("dashboard");
renderCrm();
