const crmCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const CRM_STORAGE_KEY = "d2CrmDemoFiles";
const CRM_REVENUE_STORAGE_KEY = "d2CrmRevenueRows";
const CRM_PRICE_DATABASE_KEY = "d2PriceDatabase";
const CRM_PRICE_DELETED_KEY = "d2PriceDeletedIds";
const CRM_RESET_VERSION_KEY = "d2CrmFreshDashboardVersion";
const CRM_FRESH_DASHBOARD_VERSION = "approved-estimate-start-v1";

const CRM_STATUS_DESCRIPTIONS = {
  "New Lead": "Inquiry received from your website, social media, or local referral.",
  "Contact Established": "You have spoken to the client and are actively qualifying their project scope.",
  "Contact Attempted": "A contact attempt was made. Set a next-day follow-up reminder.",
  "Inspection Completed": "You met the client, took site dimensions, and discussed wood types/finishes.",
  "In Negotiation": "Customer is considering the estimate. Set a follow-up date and keep it out of active jobs.",
  "Job Won": "The customer approved the job. Confirm whether the start date is established.",
  "In Progress": "Job has started. Confirm expected completion date and midpoint deposit.",
  "Work Completed": "Work is complete. Confirm closing call, review request, and final payment.",
  "Closed / Paid": "Job folder is archived and contact info is saved for future marketing.",
  "Job Lost / Closed": "Archive the file and save contact info for future marketing.",
};

const CRM_STATUS_DETAILS = {
  "New Lead": ["Needs Contact", "Contact Scheduled"],
  "Contact Established": ["Inspection Date Set", "Inspection Pending"],
  "Contact Attempted": ["Follow Up Tomorrow"],
  "Inspection Completed": ["Estimate Pending", "Estimate Sent"],
  "In Negotiation": ["Follow-Up Scheduled", "Waiting on Customer"],
  "Job Won": ["Start Date Established", "Start Date Pending"],
  "In Progress": ["On Schedule", "Completion Date Needed"],
  "Work Completed": ["Closing Call Made", "Closing Call Needed"],
  "Closed / Paid": ["Invoice Sent", "Invoice Not Sent"],
  "Job Lost / Closed": ["Future Marketing Follow-Up"],
};

const crmFields = [
  "clientName",
  "clientPhone",
  "clientEmail",
  "projectAddress",
  "leadSource",
  "fileStatus",
  "statusDetail",
  "projectType",
  "contactEmailSent",
  "contactTextSent",
  "inspectionDateSet",
  "inspectionDate",
  "inspectionTime",
  "startDate",
  "arrivalWindow",
  "followUpDate",
  "anticipatedCompletionDate",
  "nextAction",
  "nextActionDate",
  "warrantyStatus",
  "depositSecured",
  "initialDepositSecured",
  "initialDeposit",
  "midpointDepositSecured",
  "midpointDeposit",
  "paidInFull",
  "closingCallCompleted",
  "finalPaymentSecured",
  "finalPaymentAmount",
  "invoiceSent",
  "reviewRequested",
  "reviewSent",
  "estimateStatus",
  "invoiceStatus",
  "reviewStatus",
];

const trackedStatusFields = {
  fileStatus: "File status",
  estimateStatus: "Estimate status",
  invoiceStatus: "Invoice status",
  reviewStatus: "Review status",
};

const $ = (id) => document.getElementById(id);

let crmFiles = loadCrmFiles();
let activeFileId = crmFiles[0] ? crmFiles[0].id : null;
let crmRevenueRows = loadRevenueRows();
let activeRevenueId = crmRevenueRows[0] ? crmRevenueRows[0].id : null;
let crmPriceRows = loadPriceRows();
let crmDeletedPriceIds = loadDeletedPriceIds();
let editingPriceId = "";

function applyFreshDashboardReset() {
  try {
    if (localStorage.getItem(CRM_RESET_VERSION_KEY) === CRM_FRESH_DASHBOARD_VERSION) return;
    localStorage.setItem(CRM_STORAGE_KEY, JSON.stringify([]));
    localStorage.setItem(CRM_RESET_VERSION_KEY, CRM_FRESH_DASHBOARD_VERSION);
    crmFiles = [];
    activeFileId = null;
  } catch (error) {
    crmFiles = [];
    activeFileId = null;
  }
}

function todayIso(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}

function makeCrmFileNumber() {
  const date = new Date();
  const year = String(date.getFullYear()).slice(2);
  const existingNumbers = crmFiles
    .map((file) => String(file.fileNumber || ""))
    .map((value) => value.match(new RegExp(`^${year}-([A-Z])(\\d{4})$`)))
    .filter(Boolean)
    .map((match) => ({ series: match[1], number: Number(match[2]) }));
  for (let code = 65; code <= 90; code += 1) {
    const series = String.fromCharCode(code);
    const maxInSeries = existingNumbers
      .filter((entry) => entry.series === series)
      .reduce((max, entry) => Math.max(max, entry.number), 1000);
    if (maxInSeries < 9999) return `${year}-${series}${String(maxInSeries + 1).padStart(4, "0")}`;
  }
  return `${year}-Z${Date.now()}`;
}

function makeCrmId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function defaultFiles() {
  return [];
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

function loadPriceRows() {
  try {
    const saved = localStorage.getItem(CRM_PRICE_DATABASE_KEY);
    const rows = saved ? JSON.parse(saved) : [];
    return Array.isArray(rows) ? rows : [];
  } catch (error) {
    return [];
  }
}

function loadDeletedPriceIds() {
  try {
    const saved = localStorage.getItem(CRM_PRICE_DELETED_KEY);
    const ids = saved ? JSON.parse(saved) : [];
    return Array.isArray(ids) ? ids : [];
  } catch (error) {
    return [];
  }
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

function savePriceRows() {
  try {
    localStorage.setItem(CRM_PRICE_DATABASE_KEY, JSON.stringify(crmPriceRows));
  } catch (error) {
    // Local storage can be blocked in some browser privacy modes.
  }
}

function saveDeletedPriceIds() {
  try {
    localStorage.setItem(CRM_PRICE_DELETED_KEY, JSON.stringify(crmDeletedPriceIds));
  } catch (error) {
    // Local storage can be blocked in some browser privacy modes.
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
  file.estimateStatus = file.estimateStatus || inferEstimateStatus(file.fileStatus, file.statusDetail);
  file.invoiceStatus = file.invoiceStatus || (file.fileStatus === "Closed / Paid" ? "Paid" : "Not Created");
  file.reviewStatus = file.reviewStatus || (file.fileStatus === "Closed / Paid" ? "Requested" : "Not Ready");
  file.depositSecured = file.depositSecured || (Number(file.depositTotal) > 0 ? "Yes" : "No");
  file.initialDepositSecured = file.initialDepositSecured || file.depositSecured || (Number(file.depositTotal) > 0 ? "Yes" : "No");
  file.initialDeposit = file.initialDeposit === undefined ? file.depositTotal || "" : file.initialDeposit;
  file.midpointDepositSecured = file.midpointDepositSecured || (Number(file.midpointDeposit) > 0 ? "Yes" : "No");
  file.midpointDeposit = file.midpointDeposit === undefined ? "" : file.midpointDeposit;
  file.paidInFull = file.paidInFull || (file.invoiceStatus === "Paid" || file.fileStatus === "Closed / Paid" ? "Yes" : "No");
  file.contactEmailSent = file.contactEmailSent || "No";
  file.contactTextSent = file.contactTextSent || "No";
  file.inspectionDateSet = file.inspectionDateSet || (file.inspectionDate ? "Yes" : "No");
  file.statusDetail = file.statusDetail || (CRM_STATUS_DETAILS[file.fileStatus] || [""])[0] || "";
  file.followUpDate = file.followUpDate || "";
  file.anticipatedCompletionDate = file.anticipatedCompletionDate || "";
  file.closingCallCompleted = file.closingCallCompleted || "No";
  file.finalPaymentSecured = file.finalPaymentSecured || "No";
  file.finalPaymentAmount = file.finalPaymentAmount === undefined ? "" : file.finalPaymentAmount;
  file.invoiceSent = file.invoiceSent || (["Sent", "Deposit Paid", "Balance Due", "Paid"].includes(file.invoiceStatus) ? "Yes" : "No");
  file.invoicePaid = file.invoicePaid || file.paidInFull || "No";
  file.reviewRequested = file.reviewRequested || (["Requested", "Received"].includes(file.reviewStatus) || file.reviewSent === "Yes" ? "Yes" : "No");
  file.reviewSent = file.reviewSent || "No";
  if (file.fileNotes && !file.notes.length) {
    file.notes.push({ at: new Date().toISOString(), text: file.fileNotes });
    file.fileNotes = "";
  }
  return file;
}

function inferProjectStage(status = "") {
  if (["Job Won"].includes(status)) return "Scheduled";
  if (status === "In Progress") return "In Progress";
  if (status === "Work Completed") return "Completed";
  if (status === "Closed / Paid") return "Paid";
  if (status === "In Negotiation") return "Estimate";
  if (["Contact Established", "Inspection Completed"].includes(status)) return "Inspection";
  if (status === "Inspection Completed") return "Estimate";
  if (["Job Lost / Closed"].includes(status)) return "Closed";
  return "Lead";
}

function inferEstimateStatus(status = "", detail = "") {
  if (detail === "Estimate Pending") return "Pending";
  if (detail === "Estimate Sent") return "Sent";
  if (status === "In Negotiation") return "Sent";
  if (["Job Won", "In Progress", "Work Completed", "Closed / Paid"].includes(status)) return "Approved";
  if (status === "Job Lost / Closed") return "Declined";
  return "Not Started";
}

function isOpenCrmFile(file) {
  return !["Job Lost / Closed", "Closed / Paid"].includes(file.fileStatus);
}

function visibleFiles() {
  const filter = $("crmFileFilter").value;
  const openFiles = crmFiles.filter(isOpenCrmFile);
  if (filter === "new") return openFiles.filter((file) => file.fileStatus === "New Lead");
  if (filter === "contact") return openFiles.filter((file) => ["Contact Established", "Contact Attempted"].includes(file.fileStatus));
  if (filter === "estimate") return openFiles.filter((file) => file.fileStatus === "Inspection Completed" && ["Estimate Pending", "Estimate Sent"].includes(file.statusDetail));
  if (filter === "negotiation") return openFiles.filter((file) => file.fileStatus === "In Negotiation");
  if (filter === "active") return openFiles.filter((file) => file.fileStatus !== "In Negotiation" && (["Job Won", "In Progress", "Work Completed"].includes(file.fileStatus) || ["Scheduled", "In Progress", "Completed"].includes(file.projectStage)));
  if (filter === "archive") return crmFiles.filter((file) => ["Closed / Paid", "Job Lost / Closed"].includes(file.fileStatus));
  return openFiles;
}

function renderCounts() {
  const openFiles = crmFiles.filter(isOpenCrmFile);
  $("newLeadCount").textContent = openFiles.filter((file) => file.fileStatus === "New Lead").length;
  $("pendingContactCount").textContent = openFiles.filter((file) => ["Contact Established", "Contact Attempted"].includes(file.fileStatus)).length;
  $("pendingEstimateCount").textContent = openFiles.filter((file) => file.fileStatus === "Inspection Completed" && ["Estimate Pending", "Estimate Sent"].includes(file.statusDetail)).length;
  $("negotiationCount").textContent = openFiles.filter((file) => file.fileStatus === "In Negotiation").length;
  $("activeJobCount").textContent = openFiles.filter((file) => file.fileStatus !== "In Negotiation" && (["Job Won", "In Progress", "Work Completed"].includes(file.fileStatus) || ["Scheduled", "In Progress", "Completed"].includes(file.projectStage))).length;
  $("archivedCount").textContent = crmFiles.filter((file) => ["Closed / Paid", "Job Lost / Closed"].includes(file.fileStatus)).length;
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

function renderMaterialBreakdown(file) {
  const container = $("crmMaterialBreakdown");
  if (!container) return;
  const materials = Array.isArray(file?.materialItems) ? file.materialItems : [];
  if (!materials.length) {
    container.innerHTML = `<p class="crm-empty-state">No estimate materials attached yet.</p>`;
    return;
  }
  container.innerHTML = `
    <div class="crm-material-heading">
      <span>Materials from Estimate</span>
      <strong>${crmCurrency.format(Number(file.materialTotal) || materials.reduce((sum, item) => sum + (Number(item.total) || materialItemCost(item)), 0))}</strong>
    </div>
    <div class="crm-material-list">
      ${materials.map((item) => `
        <div class="crm-material-row">
          <span>${escapeHtml(item.name || "Material")}</span>
          <small>${escapeHtml(item.qty || "")}${item.unit ? ` ${escapeHtml(item.unit)}` : ""}</small>
          <strong>${crmCurrency.format(Number(item.total) || materialItemCost(item))}</strong>
        </div>
      `).join("")}
    </div>
  `;
}

function renderStatusDetailOptions(file) {
  const select = $("crmStatusDetail");
  if (!select) return;
  const status = $("crmFileStatus").value || file?.fileStatus || "New Lead";
  const options = CRM_STATUS_DETAILS[status] || [""];
  const current = file?.statusDetail || select.value || options[0] || "";
  select.innerHTML = options.map((option) => `<option>${escapeHtml(option)}</option>`).join("");
  select.value = options.includes(current) ? current : options[0] || "";
}

function renderActiveFile() {
  const file = normalizeCrmFile(activeFile());
  if (!file) {
    $("activeFileNumber").textContent = "No project selected";
    $("activeClientName").textContent = "Create or select a customer file";
    crmFields.forEach((field) => {
      const element = $(`crm${field[0].toUpperCase()}${field.slice(1)}`);
      if (element) element.value = "";
    });
    $("crmEstimateTotal").textContent = crmCurrency.format(0);
    $("crmMaterialTotal").textContent = crmCurrency.format(0);
    $("crmBalanceTotal").textContent = crmCurrency.format(0);
    $("crmPaidTotal").textContent = crmCurrency.format(0);
    $("crmStatusDescription").textContent = "";
    renderMaterialBreakdown(null);
    $("crmNewNote").value = "";
    $("crmNoteList").innerHTML = `<p class="crm-empty-state">No file selected.</p>`;
    $("crmTimeline").innerHTML = "<p>No timeline activity yet.</p>";
    return;
  }
  $("activeFileNumber").textContent = `Project # ${file.fileNumber}`;
  $("activeClientName").textContent = file.clientName || "Unnamed Client";
  crmFields.forEach((field) => {
    const element = $(`crm${field[0].toUpperCase()}${field.slice(1)}`);
    if (element) element.value = file[field] || "";
  });
  renderStatusDetailOptions(file);
  const estimateTotal = Number(file.estimateTotal) || 0;
  const initialDeposit = Number(file.initialDeposit) || Number(file.depositTotal) || 0;
  const midpointDeposit = Number(file.midpointDeposit) || 0;
  const finalPayment = Number(file.finalPaymentAmount) || 0;
  const paidInFull = file.paidInFull === "Yes";
  const securedTotal = paidInFull ? estimateTotal : initialDeposit + midpointDeposit + finalPayment;
  $("crmEstimateTotal").textContent = crmCurrency.format(estimateTotal);
  $("crmEstimateAmountInput").value = estimateTotal ? estimateTotal.toFixed(2) : "";
  $("crmMaterialTotal").textContent = crmCurrency.format(Number(file.materialTotal) || 0);
  $("crmMaterialAmountInput").value = Number(file.materialTotal) ? Number(file.materialTotal).toFixed(2) : "";
  $("crmBalanceTotal").textContent = crmCurrency.format(Math.max(estimateTotal - securedTotal, 0));
  $("crmPaidTotal").textContent = crmCurrency.format(Math.min(securedTotal, estimateTotal || securedTotal));
  $("crmStatusDescription").textContent = CRM_STATUS_DESCRIPTIONS[file.fileStatus] || "";
  renderMaterialBreakdown(file);
  $("crmNewNote").value = "";
  renderNotes(file);
  $("crmTimeline").innerHTML = (file.timeline || []).map((entry) => `<div>${escapeHtml(entry)}</div>`).join("") || "<p>No timeline activity yet.</p>";
}

function saveActiveFile() {
  const file = normalizeCrmFile(activeFile());
  if (!file) return;
  const changeNotes = [];
  crmFields.forEach((field) => {
    const element = $(`crm${field[0].toUpperCase()}${field.slice(1)}`);
    if (!element) return;
    const oldValue = file[field] || "";
    const newValue = element.value;
    file[field] = newValue;
    if (oldValue !== newValue) {
      const label = trackedStatusFields[field] || field.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
      changeNotes.push(`${label} changed from ${oldValue || "blank"} to ${newValue || "blank"}`);
    }
    if (trackedStatusFields[field] && oldValue && oldValue !== newValue) {
      file.timeline.push(`${trackedStatusFields[field]} changed from ${oldValue} to ${newValue} on ${formatNoteTimestamp(new Date().toISOString())}`);
    }
  });
  if (!file.timeline) file.timeline = [];
  if (changeNotes.length) {
    const timestamp = new Date().toISOString();
    file.notes.push({ at: timestamp, text: changeNotes.join("\n") });
    file.timeline.push(`File updated ${formatNoteTimestamp(timestamp)}`);
  }
  saveCrmFiles();
}

function toggleEstimateAmountEdit() {
  const panel = $("crmEstimateEditPanel");
  panel.hidden = !panel.hidden;
  if (!panel.hidden) {
    $("crmEstimateAmountInput").focus();
    $("crmEstimateAmountInput").select();
  }
}

function saveEstimateAmountEdit() {
  const file = normalizeCrmFile(activeFile());
  if (!file) return;
  const oldAmount = Number(file.estimateTotal) || 0;
  const newAmount = parseMoney($("crmEstimateAmountInput").value);
  file.estimateTotal = newAmount;
  if (file.editableEstimate?.totals) file.editableEstimate.totals.total = newAmount;
  if (oldAmount !== newAmount) {
    addSystemNote(file, `Estimate amount changed from ${crmCurrency.format(oldAmount)} to ${crmCurrency.format(newAmount)}.`);
  }
  $("crmEstimateEditPanel").hidden = true;
  saveCrmFiles();
  renderCrm();
}

function toggleMaterialAmountEdit() {
  const panel = $("crmMaterialEditPanel");
  panel.hidden = !panel.hidden;
  if (!panel.hidden) {
    $("crmMaterialAmountInput").focus();
    $("crmMaterialAmountInput").select();
  }
}

function saveMaterialAmountEdit() {
  const file = normalizeCrmFile(activeFile());
  if (!file) return;
  const oldAmount = Number(file.materialTotal) || 0;
  const newAmount = parseMoney($("crmMaterialAmountInput").value);
  file.materialTotal = newAmount;
  if (oldAmount !== newAmount) {
    addSystemNote(file, `Materials amount changed from ${crmCurrency.format(oldAmount)} to ${crmCurrency.format(newAmount)}.`);
  }
  $("crmMaterialEditPanel").hidden = true;
  saveCrmFiles();
  renderCrm();
}

function addSystemNote(file, text) {
  if (!text) return;
  const timestamp = new Date().toISOString();
  file.notes = [...(file.notes || []), { at: timestamp, text }];
  file.timeline = [...(file.timeline || []), `Workflow note added ${formatNoteTimestamp(timestamp)}`];
}

function openDateField(id) {
  const field = $(id);
  if (!field) return;
  field.focus();
  if (typeof field.showPicker === "function") {
    try {
      field.showPicker();
    } catch (error) {
      // Some browsers only allow date pickers from direct user gestures.
    }
  }
}

function requireCrmReason(message, notePrefix) {
  const file = normalizeCrmFile(activeFile());
  if (!file) return;
  const reason = window.prompt(message);
  if (reason) addSystemNote(file, `${notePrefix}: ${reason}`);
}

function handleCrmControlWorkflow(event) {
  const element = event.target;
  if (!element || !element.id) return;
  if (element.id === "crmInspectionDateSet") {
    if (element.value === "Yes") {
      openDateField("crmInspectionDate");
    } else {
      requireCrmReason("Inspection date is not set. Add a note explaining why.", "Inspection date not set");
    }
  }
  if (element.id === "crmInitialDepositSecured" && element.value === "No") {
    requireCrmReason("Initial deposit is not secured. Add a note explaining why.", "Initial deposit not secured");
  }
  if (element.id === "crmMidpointDepositSecured" && element.value === "No") {
    requireCrmReason("Midpoint deposit is not secured. Add a note explaining why.", "Midpoint deposit not secured");
  }
  if (element.id === "crmFinalPaymentSecured" && element.value === "No") {
    requireCrmReason("Final payment is not secured. Add a note explaining why.", "Final payment not secured");
  }
  if (element.id === "crmInvoiceSent" && element.value === "No") {
    requireCrmReason("Invoice has not been sent. Add a note explaining why.", "Invoice not sent");
  }
  if (element.id === "crmReviewRequested" && element.value === "No") {
    requireCrmReason("Review has not been requested. Add a note explaining why.", "Review not requested");
  }
}

function handleStatusWorkflow() {
  const file = normalizeCrmFile(activeFile());
  if (!file) return;
  const status = $("crmFileStatus").value;
  const detail = $("crmStatusDetail").value;
  $("crmStatusDescription").textContent = CRM_STATUS_DESCRIPTIONS[status] || "";

  if (status === "Contact Attempted") {
    const tomorrow = todayIso(1);
    $("crmFollowUpDate").value = tomorrow;
    $("crmNextActionDate").value = tomorrow;
    $("crmNextAction").value = "Follow up after contact attempt";
    addSystemNote(file, "Contact attempted. Follow-up reminder set for next day.");
  }

  if (status === "Contact Established" && detail === "Inspection Pending") {
    const reason = window.prompt("Inspection is pending. Add a note explaining what is needed.");
    if (reason) addSystemNote(file, `Inspection pending: ${reason}`);
    $("crmNextAction").value = "Schedule inspection";
  }

  if (status === "Contact Established" && detail === "Inspection Date Set" && !$("crmInspectionDate").value) {
    $("crmNextAction").value = "Set inspection date";
    openDateField("crmInspectionDate");
  }

  if (status === "Inspection Completed" && detail === "Estimate Pending") {
    $("crmEstimateStatus").value = "Pending";
    $("crmNextAction").value = "Prepare estimate";
  }

  if (status === "Inspection Completed" && detail === "Estimate Sent") {
    $("crmEstimateStatus").value = "Sent";
    if (!$("crmFollowUpDate").value) {
      const followUp = window.prompt("Estimate sent. Set follow-up date. Use YYYY-MM-DD.");
      if (followUp) {
        $("crmFollowUpDate").value = followUp;
        $("crmNextActionDate").value = followUp;
      }
    }
    const made = window.confirm("Has the estimate follow-up been made?");
    addSystemNote(file, made ? "Estimate sent and follow-up has been made." : "Estimate sent. Follow-up still needs to be made.");
    if (!made) $("crmNextAction").value = "Follow up on sent estimate";
  }

  if (status === "In Negotiation") {
    $("crmEstimateStatus").value = "Sent";
    if (!$("crmFollowUpDate").value) {
      const followUp = window.prompt("Set a follow-up date for this negotiation. Use YYYY-MM-DD.");
      if (followUp) {
        $("crmFollowUpDate").value = followUp;
        $("crmNextActionDate").value = followUp;
      }
    }
    $("crmNextAction").value = "Follow up on negotiation";
  }

  if (status === "Job Won" && detail === "Start Date Pending") {
    const reason = window.prompt("Start date is not established. Add a note explaining why.");
    if (reason) addSystemNote(file, `Start date pending: ${reason}`);
    $("crmNextAction").value = "Establish start date";
  }

  if (status === "Job Won" && detail === "Start Date Established" && !$("crmStartDate").value) {
    $("crmNextAction").value = "Set start date";
    openDateField("crmStartDate");
  }

  if (status === "In Progress") {
    if (!$("crmAnticipatedCompletionDate").value) {
      $("crmNextAction").value = "Set anticipated completion date";
      openDateField("crmAnticipatedCompletionDate");
    }
    if (!$("crmMidpointDeposit").value) {
      const reason = window.prompt("Midpoint deposit is not entered yet. Add a note explaining why.");
      if (reason) addSystemNote(file, `Midpoint deposit not secured: ${reason}`);
    }
  }

  if (status === "Work Completed") {
    if (detail === "Closing Call Made") {
      $("crmClosingCallCompleted").value = "Yes";
    }
    if (detail === "Closing Call Needed" || $("crmClosingCallCompleted").value !== "Yes") {
      const reason = window.prompt("Closing call has not been made. Add a note explaining why.");
      if (reason) addSystemNote(file, `Closing call not completed: ${reason}`);
      $("crmNextAction").value = "Complete closing call";
    }
  }

  if (status === "Closed / Paid") {
    $("crmPaidInFull").value = "Yes";
    $("crmFinalPaymentSecured").value = "Yes";
    if (detail === "Invoice Not Sent") {
      const reason = window.prompt("Invoice has not been sent. Add a note explaining why.");
      if (reason) addSystemNote(file, `Closed/Paid without invoice sent: ${reason}`);
    } else {
      $("crmInvoiceStatus").value = "Sent";
    }
    $("crmNextAction").value = "Archived for future marketing";
    activateCrmFilter("archive");
  }

  if (status === "Job Lost / Closed") {
    $("crmNextAction").value = "Future marketing follow-up";
    if (!$("crmFollowUpDate").value) {
      const followUp = window.prompt("Set a future marketing follow-up date, if desired. Use YYYY-MM-DD.");
      if (followUp) {
        $("crmFollowUpDate").value = followUp;
        $("crmNextActionDate").value = followUp;
      }
    }
    addSystemNote(file, "Job lost/closed. Contact information retained for future marketing follow-up.");
    activateCrmFilter("archive");
  }

  saveActiveFile();
  renderCrm();
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
    id: makeCrmId("file"),
    fileNumber: makeCrmFileNumber(),
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    projectAddress: "",
    leadSource: "Manual",
    fileStatus: "New Lead",
    statusDetail: "Needs Contact",
    projectType: "Other",
    projectStage: "Lead",
    contactEmailSent: "No",
    contactTextSent: "No",
    inspectionDateSet: "No",
    inspectionDate: "",
    inspectionTime: "",
    startDate: "",
    arrivalWindow: "Open",
    followUpDate: "",
    anticipatedCompletionDate: "",
    nextAction: "Contact customer",
    nextActionDate: todayIso(1),
    warrantyStatus: "Not Sent",
    depositSecured: "No",
    initialDepositSecured: "No",
    initialDeposit: "",
    midpointDepositSecured: "No",
    midpointDeposit: "",
    paidInFull: "No",
    closingCallCompleted: "No",
    finalPaymentSecured: "No",
    finalPaymentAmount: "",
    invoiceSent: "No",
    invoicePaid: "No",
    reviewRequested: "No",
    reviewSent: "No",
    estimateStatus: "Not Started",
    invoiceStatus: "Not Created",
    reviewStatus: "Not Ready",
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

function openActiveEstimate(target = "") {
  saveActiveFile();
  const file = activeFile();
  if (!file) {
    window.alert("Select a customer file first.");
    return;
  }
  if (!file.editableEstimate) {
    window.alert("This customer file does not have an attached editable estimate yet. Import an approved estimate first.");
    return;
  }
  try {
    localStorage.setItem("d2EstimateStudio", JSON.stringify(file.editableEstimate));
  } catch (error) {
    window.alert("The estimate could not be loaded into this browser. Try refreshing and opening it again.");
    return;
  }
  window.open(`index.html${target}`, "_blank", "noopener");
}

function searchCrmFile() {
  const query = String($("crmFileSearch").value || "").trim().toLowerCase();
  if (!query) return;
  const match = crmFiles.find((file) => {
    return String(file.fileNumber || "").toLowerCase().includes(query)
      || String(file.clientName || "").toLowerCase().includes(query)
      || String(file.clientPhone || "").toLowerCase().includes(query)
      || String(file.projectAddress || "").toLowerCase().includes(query);
  });
  if (!match) {
    window.alert("No matching project file was found.");
    return;
  }
  saveActiveFile();
  activeFileId = match.id;
  activateCrmFilter(filterForCrmFile(match));
  renderCrm();
}

function filterForCrmFile(file) {
  if (!isOpenCrmFile(file)) return "archive";
  if (file.fileStatus === "New Lead") return "new";
  if (["Contact Established", "Contact Attempted"].includes(file.fileStatus)) return "contact";
  if (file.fileStatus === "Inspection Completed") return "estimate";
  if (file.fileStatus === "In Negotiation") return "negotiation";
  return "active";
}

function activateCrmFilter(filter) {
  document.querySelectorAll("[data-crm-filter]").forEach((item) => {
    item.classList.toggle("active", item.dataset.crmFilter === filter);
  });
  $("crmFileFilter").value = filter;
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

function materialItemCost(item) {
  const qty = parseMoney(item.qty || item.quantity || 0);
  const price = parseMoney(item.price || item.unitCost || item.cost || 0);
  return qty * price;
}

function estimateMaterialItems(data) {
  if (!Array.isArray(data.materialItems)) return [];
  return data.materialItems
    .filter((item) => String(item.name || "").trim() || materialItemCost(item))
    .map((item) => ({
      name: String(item.name || "Material").trim(),
      qty: item.qty || item.quantity || "",
      unit: item.unit || "",
      price: parseMoney(item.price || item.unitCost || item.cost || 0),
      total: materialItemCost(item),
    }));
}

function estimateMaterialTotal(data) {
  if (data && data.backend && Number(data.backend.estimatedMaterialCost)) {
    return Number(data.backend.estimatedMaterialCost) || 0;
  }
  if (Array.isArray(data.materialItems)) {
    return data.materialItems.reduce((total, item) => total + materialItemCost(item), 0);
  }
  return 0;
}

function estimateReceiptNotes(data) {
  if (!Array.isArray(data.materialItems) || !data.materialItems.length) return "";
  return data.materialItems
    .filter((item) => String(item.name || "").trim() || materialItemCost(item))
    .map((item) => {
      const qty = item.qty || item.quantity || "";
      const price = parseMoney(item.price || item.unitCost || item.cost || 0);
      const total = materialItemCost(item);
      const parts = [String(item.name || "Material").trim()];
      if (qty !== "") parts.push(`qty ${qty}`);
      if (price) parts.push(crmCurrency.format(price));
      if (total) parts.push(`total ${crmCurrency.format(total)}`);
      return parts.join(" - ");
    })
    .join("\n");
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

function parseEstimateFileText(text) {
  const raw = String(text || "").trim().replace(/^\uFEFF/, "");
  if (!raw) throw new Error("The file is empty.");
  if (raw.startsWith("%PDF")) throw new Error("That is a PDF. Please upload the editable .d2estimate file.");
  if (/^<!doctype html|^<html/i.test(raw)) throw new Error("That is an HTML copy. Please upload the editable .d2estimate file.");
  try {
    return JSON.parse(raw);
  } catch (error) {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(raw.slice(start, end + 1));
    throw error;
  }
}

function isUsableEstimateNumber(value) {
  const text = String(value || "").trim();
  return Boolean(text) && text.toLowerCase() !== "estimate";
}

function estimateFileNumber(data, row) {
  const estimateNumber = data?.estimateNumber || row?.attachedEstimate?.estimateNumber || row?.attachedEstimate?.fileNumber;
  return isUsableEstimateNumber(estimateNumber) ? String(estimateNumber).trim() : makeCrmFileNumber();
}

function revenueRowFromEstimate(data, fileName) {
  if (!data || typeof data !== "object") throw new Error("That estimate file could not be read.");
  const estimateNumber = estimateFileNumber(data);
  const clientName = data.clientName || "Unnamed Client";
  const gross = Number(data.totals && data.totals.total) || parseMoney(data.total) || 0;
  const expenses = estimateMaterialTotal(data);
  const labor = 0;
  return {
    id: makeCrmId("rev-estimate"),
    date: normalizeDate(data.date || data.submittedAt || todayIso(0)),
    clientJob: `${clientName} - ${estimateNumber}`,
    gross,
    expenses,
    labor,
    profit: gross - expenses - labor,
    receiptNotes: estimateReceiptNotes(data),
    laborAssigns: "",
    attachedEstimate: {
      fileName: fileName || "",
      estimateNumber,
      clientName,
      clientPhone: data.clientPhone || "",
      clientEmail: data.clientEmail || "",
      projectAddress: data.clientAddress || data.projectAddress || "",
      total: gross,
      materialTotal: expenses,
      materialItems: estimateMaterialItems(data),
      savedAt: new Date().toISOString(),
    },
  };
}

function dashboardFileFromEstimate(data, row) {
  const importedAt = new Date().toISOString();
  const estimateNumber = estimateFileNumber(data, row);
  const existing = crmFiles.find((file) => file.fileNumber === estimateNumber);
  const estimateDeposit = Number(data.totals && data.totals.deposit) || 0;
  const file = {
    ...(existing || {}),
    id: existing?.id || makeCrmId("file"),
    fileNumber: estimateNumber,
    clientName: data.clientName || row.attachedEstimate?.clientName || "Unnamed Client",
    clientPhone: data.clientPhone || "",
    clientEmail: data.clientEmail || "",
    projectAddress: data.projectAddress || data.clientAddress || "",
    leadSource: data.leadSource || existing?.leadSource || "Estimate Upload",
    fileStatus: data.fileStatus || existing?.fileStatus || "New Lead",
    statusDetail: existing?.statusDetail || data.statusDetail || "Needs Contact",
    projectType: data.projectType || existing?.projectType || "Other",
    projectStage: existing?.projectStage || "Lead",
    contactEmailSent: existing?.contactEmailSent || "No",
    contactTextSent: existing?.contactTextSent || "No",
    inspectionDateSet: existing?.inspectionDateSet || (data.inspectionDate ? "Yes" : "No"),
    inspectionDate: data.inspectionDate || existing?.inspectionDate || "",
    inspectionTime: data.inspectionTime || existing?.inspectionTime || "",
    startDate: data.assignmentStartDate || existing?.startDate || "",
    arrivalWindow: data.assignmentArrivalTime || existing?.arrivalWindow || "Open",
    followUpDate: existing?.followUpDate || "",
    anticipatedCompletionDate: existing?.anticipatedCompletionDate || "",
    nextAction: data.nextAction || existing?.nextAction || "Review estimate and contact customer",
    nextActionDate: data.nextActionDate || existing?.nextActionDate || todayIso(1),
    warrantyStatus: data.warrantyStatus || existing?.warrantyStatus || "Not Sent",
    depositSecured: existing?.depositSecured || (estimateDeposit > 0 ? "Yes" : "No"),
    initialDepositSecured: existing?.initialDepositSecured || (estimateDeposit > 0 ? "Yes" : "No"),
    initialDeposit: existing?.initialDeposit === undefined ? estimateDeposit || "" : existing.initialDeposit,
    midpointDepositSecured: existing?.midpointDepositSecured || (Number(existing?.midpointDeposit) > 0 ? "Yes" : "No"),
    midpointDeposit: existing?.midpointDeposit || "",
    paidInFull: existing?.paidInFull || "No",
    closingCallCompleted: existing?.closingCallCompleted || "No",
    finalPaymentSecured: existing?.finalPaymentSecured || "No",
    finalPaymentAmount: existing?.finalPaymentAmount || "",
    invoiceSent: existing?.invoiceSent || "No",
    invoicePaid: existing?.invoicePaid || existing?.paidInFull || "No",
    reviewRequested: existing?.reviewRequested || "No",
    reviewSent: existing?.reviewSent || "No",
    estimateStatus: data.estimateStatus || existing?.estimateStatus || "Estimate Completed",
    invoiceStatus: existing?.invoiceStatus || "Not Created",
    reviewStatus: existing?.reviewStatus || "Not Ready",
    estimateTotal: Number(row.gross) || 0,
    depositTotal: estimateDeposit,
    materialTotal: Number(row.expenses) || 0,
    materialItems: estimateMaterialItems(data),
    editableEstimate: data,
    notes: Array.isArray(existing?.notes) && existing.notes.length
      ? existing.notes
      : [{ at: importedAt, text: data.notes || "Estimate uploaded into Revenue. Treat as a new lead/customer file." }],
    timeline: [
      ...(Array.isArray(existing?.timeline) ? existing.timeline : []),
      existing ? `Estimate file updated ${formatNoteTimestamp(importedAt)}` : `Estimate file uploaded ${formatNoteTimestamp(importedAt)}`,
    ],
  };
  return file;
}

function dashboardApprovedFileFromEstimate(data, row) {
  const file = dashboardFileFromEstimate(data, row);
  const importedAt = new Date().toISOString();
  return {
    ...file,
    fileStatus: "Job Won",
    statusDetail: "Start Date Pending",
    projectStage: "Scheduled",
    estimateStatus: "Approved",
    invoiceStatus: "Not Created",
    nextAction: "Set start date, create invoice, and prepare assignment",
    nextActionDate: todayIso(1),
    notes: [
      ...(Array.isArray(file.notes) ? file.notes : []),
      { at: importedAt, text: "Approved estimate imported. Next step: set start date, prepare invoice/deposit, and build assignment." },
    ],
    timeline: [...(Array.isArray(file.timeline) ? file.timeline : []), `Approved estimate imported ${formatNoteTimestamp(importedAt)}`],
  };
}

function upsertDashboardFileFromEstimate(data, row, options = {}) {
  const file = options.approved ? dashboardApprovedFileFromEstimate(data, row) : dashboardFileFromEstimate(data, row);
  const existingIndex = crmFiles.findIndex((entry) => entry.id === file.id || entry.fileNumber === file.fileNumber);
  if (existingIndex >= 0) {
    crmFiles[existingIndex] = file;
  } else {
    crmFiles.unshift(file);
  }
  row.dashboardFileId = file.id;
  row.attachedEstimate = {
    ...(row.attachedEstimate || {}),
    dashboardFileId: file.id,
    fileNumber: file.fileNumber,
  };
  activeFileId = file.id;
  saveCrmFiles();
  return file;
}

function createDashboardFileFromRevenueRow(row) {
  const estimate = row.attachedEstimate || {};
  const importedAt = new Date().toISOString();
  const file = {
    id: makeCrmId("file"),
    fileNumber: estimate.fileNumber || estimate.estimateNumber || makeCrmFileNumber(),
    clientName: estimate.clientName || row.clientJob || "Unnamed Client",
    clientPhone: estimate.clientPhone || "",
    clientEmail: estimate.clientEmail || "",
    projectAddress: estimate.projectAddress || "",
    leadSource: "Estimate Upload",
    fileStatus: "New Lead",
    statusDetail: "Needs Contact",
    projectType: "Other",
    projectStage: "Lead",
    contactEmailSent: "No",
    contactTextSent: "No",
    inspectionDateSet: "No",
    inspectionDate: "",
    inspectionTime: "",
    startDate: "",
    arrivalWindow: "Open",
    followUpDate: "",
    anticipatedCompletionDate: "",
    nextAction: "Review estimate and contact customer",
    nextActionDate: todayIso(1),
    warrantyStatus: "Not Sent",
    depositSecured: "No",
    initialDepositSecured: "No",
    initialDeposit: "",
    midpointDepositSecured: "No",
    midpointDeposit: "",
    paidInFull: "No",
    closingCallCompleted: "No",
    finalPaymentSecured: "No",
    finalPaymentAmount: "",
    invoiceSent: "No",
    invoicePaid: "No",
    reviewRequested: "No",
    reviewSent: "No",
    estimateStatus: "Estimate Completed",
    invoiceStatus: "Not Created",
    reviewStatus: "Not Ready",
    estimateTotal: Number(row.gross) || 0,
    depositTotal: 0,
    materialTotal: Number(row.expenses) || 0,
    materialItems: Array.isArray(estimate.materialItems) ? estimate.materialItems : [],
    notes: [{ at: importedAt, text: "Lead file created from an attached Revenue estimate." }],
    timeline: [`Revenue estimate linked ${formatNoteTimestamp(importedAt)}`],
  };
  crmFiles.unshift(file);
  row.dashboardFileId = file.id;
  row.attachedEstimate = {
    ...estimate,
    dashboardFileId: file.id,
    fileNumber: file.fileNumber,
  };
  activeFileId = file.id;
  saveCrmFiles();
  saveRevenueRows();
  return file;
}

function revenueTotals() {
  return crmRevenueRows.reduce(
    (totals, row) => {
      totals.gross += Number(row.gross) || 0;
      totals.expenses += Number(row.expenses) || 0;
      totals.labor += Number(row.labor) || 0;
      totals.profit += revenueProfit(row);
      return totals;
    },
    { gross: 0, expenses: 0, labor: 0, profit: 0 },
  );
}

function revenueProfit(row) {
  return (Number(row.gross) || 0) - (Number(row.expenses) || 0) - (Number(row.labor) || 0);
}

function findFileForRevenue(row) {
  if (row.dashboardFileId) {
    const linkedFile = crmFiles.find((file) => file.id === row.dashboardFileId);
    if (linkedFile) return linkedFile;
  }
  if (row.attachedEstimate?.dashboardFileId) {
    const linkedFile = crmFiles.find((file) => file.id === row.attachedEstimate.dashboardFileId);
    if (linkedFile) return linkedFile;
  }
  if (row.attachedEstimate?.fileNumber) {
    const numberedFile = crmFiles.find((file) => file.fileNumber === row.attachedEstimate.fileNumber);
    if (numberedFile) return numberedFile;
  }
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
          <td><input class="crm-revenue-input crm-revenue-date" type="date" value="${escapeHtml(row.date || "")}" data-revenue-edit="${escapeHtml(row.id)}" data-revenue-field="date"></td>
          <td>
            <input class="crm-revenue-input crm-revenue-job" type="text" value="${escapeHtml(row.clientJob || "")}" data-revenue-edit="${escapeHtml(row.id)}" data-revenue-field="clientJob" placeholder="Client / job">
            ${file ? `<small>${escapeHtml(file.fileNumber)}</small>` : ""}
          </td>
          <td><input class="crm-revenue-input crm-money-input" inputmode="decimal" value="${escapeHtml(Number(row.gross) || "")}" data-revenue-edit="${escapeHtml(row.id)}" data-revenue-field="gross" placeholder="0"></td>
          <td><input class="crm-revenue-input crm-money-input" inputmode="decimal" value="${escapeHtml(Number(row.expenses) || "")}" data-revenue-edit="${escapeHtml(row.id)}" data-revenue-field="expenses" placeholder="0"></td>
          <td><input class="crm-revenue-input crm-money-input" inputmode="decimal" value="${escapeHtml(Number(row.labor) || "")}" data-revenue-edit="${escapeHtml(row.id)}" data-revenue-field="labor" placeholder="0"></td>
          <td><strong class="crm-profit-value">${crmCurrency.format(revenueProfit(row))}</strong></td>
          <td><textarea class="crm-revenue-input crm-revenue-notes" data-revenue-edit="${escapeHtml(row.id)}" data-revenue-field="receiptNotes" placeholder="Receipt notes">${escapeHtml(row.receiptNotes || "")}</textarea></td>
          <td><input class="crm-revenue-input" type="text" value="${escapeHtml(row.laborAssigns || "")}" data-revenue-edit="${escapeHtml(row.id)}" data-revenue-field="laborAssigns" placeholder="Labor"></td>
          <td class="crm-revenue-actions">
            <button type="button" data-revenue-id="${escapeHtml(row.id)}">View</button>
            <button type="button" data-revenue-delete="${escapeHtml(row.id)}">Delete</button>
          </td>
        </tr>
      `;
    })
    .join("");

  document.querySelectorAll("[data-revenue-id]").forEach((button) => {
    button.addEventListener("click", () => {
      activeRevenueId = button.dataset.revenueId;
      renderRevenue();
      window.setTimeout(() => {
        $("crmExpenseDetail")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    });
  });
  document.querySelectorAll("[data-revenue-delete]").forEach((button) => {
    button.addEventListener("click", () => deleteRevenueRow(button.dataset.revenueDelete));
  });
  document.querySelectorAll("[data-revenue-edit]").forEach((field) => {
    field.addEventListener("change", () => updateRevenueField(field));
    field.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && field.tagName !== "TEXTAREA") {
        event.preventDefault();
        field.blur();
      }
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
      <div><dt>Profit</dt><dd>${crmCurrency.format(revenueProfit(row))}</dd></div>
    </dl>
    <label class="crm-revenue-editor">
      <span>Receipt Notes</span>
      <textarea rows="7" data-expense-detail-field="receiptNotes">${escapeHtml(row.receiptNotes || "")}</textarea>
    </label>
    <label class="crm-revenue-editor">
      <span>Labor Assigns</span>
      <input type="text" value="${escapeHtml(row.laborAssigns || "")}" data-expense-detail-field="laborAssigns">
    </label>
    ${
      row.attachedEstimate
        ? `<div class="crm-attached-estimate">
            <p class="eyebrow">Attached Estimate</p>
            <strong>${escapeHtml(row.attachedEstimate.estimateNumber || "Estimate")}</strong>
            <span>${escapeHtml(row.attachedEstimate.clientName || row.clientJob || "")}</span>
            <span>${escapeHtml(row.attachedEstimate.fileName || "")}</span>
            <em>Next: open the lead file, contact the customer, and schedule the inspection or follow-up.</em>
          </div>`
        : `<p class="crm-empty-state">No estimate file attached yet.</p>`
    }
    <div class="crm-add-expense">
      <label>
        <span>New Expense Note</span>
        <input type="text" id="crmExpenseVendor" placeholder="Home Depot, Sherwin, Amazon">
      </label>
      <label>
        <span>Amount</span>
        <input type="text" inputmode="decimal" id="crmExpenseAmount" placeholder="0.00">
      </label>
      <button type="button" id="crmAddExpenseLine">Add Expense</button>
    </div>
    ${
      file || row.attachedEstimate
        ? `<button type="button" class="icon-button" id="crmOpenRevenueFile">${file ? "Open Lead File" : "Create Lead File"}</button>`
        : `<p class="crm-empty-state">No matching customer file linked yet.</p>`
    }
  `;
  document.querySelectorAll("[data-expense-detail-field]").forEach((field) => {
    field.addEventListener("change", () => {
      row[field.dataset.expenseDetailField] = field.value;
      saveRevenueRows();
      renderRevenue();
    });
  });
  const addExpenseButton = $("crmAddExpenseLine");
  if (addExpenseButton) {
    addExpenseButton.addEventListener("click", () => addExpenseLine(row.id));
  }
  const openButton = $("crmOpenRevenueFile");
  if (openButton && (file || row.attachedEstimate)) {
    openButton.addEventListener("click", () => {
      const linkedFile = file || createDashboardFileFromRevenueRow(row);
      activeFileId = linkedFile.id;
      switchCrmView("dashboard");
      renderCrm();
    });
  }
}

function updateRevenueField(field) {
  const row = crmRevenueRows.find((entry) => entry.id === field.dataset.revenueEdit);
  if (!row) return;
  const key = field.dataset.revenueField;
  if (["gross", "expenses", "labor"].includes(key)) {
    row[key] = parseMoney(field.value);
  } else if (key === "date") {
    row[key] = normalizeDate(field.value);
  } else {
    row[key] = field.value;
  }
  row.profit = revenueProfit(row);
  activeRevenueId = row.id;
  saveRevenueRows();
  renderRevenue();
}

function addExpenseLine(rowId) {
  const row = crmRevenueRows.find((entry) => entry.id === rowId);
  if (!row) return;
  const vendor = $("crmExpenseVendor").value.trim();
  const amount = parseMoney($("crmExpenseAmount").value);
  if (!vendor && !amount) {
    window.alert("Add an expense note or amount first.");
    return;
  }
  const note = amount ? `${vendor || "Expense"}: ${crmCurrency.format(amount)}` : vendor;
  row.receiptNotes = [row.receiptNotes, note].filter(Boolean).join("\n");
  row.expenses = (Number(row.expenses) || 0) + amount;
  row.profit = revenueProfit(row);
  saveRevenueRows();
  renderRevenue();
}

function deleteRevenueRow(rowId) {
  const row = crmRevenueRows.find((entry) => entry.id === rowId);
  if (!row) return;
  if (!window.confirm(`Delete the revenue row for ${row.clientJob || "this job"}?`)) return;
  crmRevenueRows = crmRevenueRows.filter((entry) => entry.id !== rowId);
  activeRevenueId = crmRevenueRows[0] ? crmRevenueRows[0].id : null;
  saveRevenueRows();
  renderRevenue();
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
  const row = {
    id: makeCrmId("rev"),
    date: todayIso(0),
    clientJob: "",
    gross: 0,
    expenses: 0,
    labor: 0,
    profit: 0,
    receiptNotes: "",
    laborAssigns: "",
  };
  crmRevenueRows.unshift(row);
  activeRevenueId = row.id;
  saveRevenueRows();
  renderRevenue();
}

function uploadEstimateToRevenue(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const data = parseEstimateFileText(reader.result);
      const row = revenueRowFromEstimate(data, file.name);
      const dashboardFile = upsertDashboardFileFromEstimate(data, row);
      crmRevenueRows.unshift(row);
      activeRevenueId = row.id;
      saveRevenueRows();
      renderRevenue();
      window.alert(`${dashboardFile.clientName || "Customer"} was added as a Dashboard lead and linked to Revenue.`);
    } catch (error) {
      window.alert(`${error.message || "That file could not be uploaded."} Please choose an editable D2 estimate file ending in .d2estimate.`);
    }
  });
  reader.readAsText(file);
}

function importApprovedEstimateFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const data = parseEstimateFileText(reader.result);
      const row = revenueRowFromEstimate(data, file.name);
      const dashboardFile = upsertDashboardFileFromEstimate(data, row, { approved: true });
      crmRevenueRows.unshift(row);
      activeRevenueId = row.id;
      activeFileId = dashboardFile.id;
      saveRevenueRows();
      switchCrmView("dashboard");
      renderCrm();
      window.alert(`${dashboardFile.clientName || "Approved estimate"} is now your active Dashboard file.`);
    } catch (error) {
      window.alert(`${error.message || "That file could not be imported."} Please choose an editable D2 estimate file ending in .d2estimate.`);
    }
  });
  reader.readAsText(file);
}

function priceDatabaseRows() {
  const deletedIds = new Set(crmDeletedPriceIds);
  const customRows = crmPriceRows.map((row) => ({ ...row, readonly: false }));
  const overriddenIds = new Set(customRows.map((row) => row.sourceId).filter(Boolean));
  const baseRows = Array.isArray(window.D2_MATERIALS_DATABASE)
    ? window.D2_MATERIALS_DATABASE
        .filter((row) => !overriddenIds.has(row.id) && !deletedIds.has(row.id))
        .map((row) => ({ ...row, readonly: true }))
    : [];
  return [...customRows.filter((row) => !deletedIds.has(row.id) && !deletedIds.has(row.sourceId)), ...baseRows];
}

function visiblePriceDatabaseRows() {
  const query = String($("crmPriceSearch")?.value || "").trim().toLowerCase();
  const sort = $("crmPriceSort")?.value || "name";
  const rows = priceDatabaseRows().filter((row) => {
    if (!query) return true;
    const haystack = [row.product, row.category, row.vendor, row.source, row.unit, row.id].join(" ").toLowerCase();
    return haystack.includes(query);
  });
  const textValue = (row, key) => String(row[key] || "").toLowerCase();
  return rows.sort((a, b) => {
    if (sort === "price") return (Number(a.defaultPrice) || 0) - (Number(b.defaultPrice) || 0);
    if (sort === "category") return textValue(a, "category").localeCompare(textValue(b, "category")) || textValue(a, "product").localeCompare(textValue(b, "product"));
    if (sort === "vendor") return textValue(a, "vendor").localeCompare(textValue(b, "vendor")) || textValue(a, "product").localeCompare(textValue(b, "product"));
    return textValue(a, "product").localeCompare(textValue(b, "product"));
  });
}

function renderPriceDatabase() {
  const rows = visiblePriceDatabaseRows();
  $("crmPriceList").innerHTML = rows.length
    ? rows.map((row) => `
      ${row.id === editingPriceId ? renderEditablePriceRow(row) : renderReadonlyPriceRow(row)}
    `).join("")
    : `<p class="crm-empty-state">No price lines yet.</p>`;
  document.querySelectorAll("[data-price-edit]").forEach((button) => {
    button.addEventListener("click", () => {
      editingPriceId = button.dataset.priceEdit;
      renderPriceDatabase();
    });
  });
  document.querySelectorAll("[data-price-save]").forEach((button) => {
    button.addEventListener("click", () => savePriceLineEdit(button.dataset.priceSave));
  });
  document.querySelectorAll("[data-price-cancel]").forEach((button) => {
    button.addEventListener("click", () => {
      editingPriceId = "";
      renderPriceDatabase();
    });
  });
  document.querySelectorAll("[data-price-delete]").forEach((button) => {
    button.addEventListener("click", () => deletePriceLine(button.dataset.priceDelete));
  });
}

function renderReadonlyPriceRow(row) {
  return `
    <div class="crm-price-row">
      <div>
        <strong>${escapeHtml(row.product)}</strong>
        <span>${escapeHtml([row.category, row.vendor].filter(Boolean).join(" - "))}</span>
      </div>
      <small>${escapeHtml(row.unit || "each")}</small>
      <strong>${crmCurrency.format(Number(row.defaultPrice) || 0)}</strong>
      <button type="button" data-price-edit="${escapeHtml(row.id)}">Edit</button>
      <button type="button" data-price-delete="${escapeHtml(row.id)}">Delete</button>
      ${row.readonly ? `<em>Estimator</em>` : ""}
    </div>
  `;
}

function renderEditablePriceRow(row) {
  return `
    <div class="crm-price-row crm-price-row-editing">
      <input data-price-field="product" data-price-id="${escapeHtml(row.id)}" value="${escapeHtml(row.product)}" placeholder="Item name">
      <input data-price-field="defaultPrice" data-price-id="${escapeHtml(row.id)}" type="number" min="0" step="0.01" value="${escapeHtml(Number(row.defaultPrice) || "")}" placeholder="Price">
      <input data-price-field="unit" data-price-id="${escapeHtml(row.id)}" value="${escapeHtml(row.unit || "each")}" placeholder="Unit">
      <input data-price-field="category" data-price-id="${escapeHtml(row.id)}" value="${escapeHtml(row.category || "")}" placeholder="Category">
      <input data-price-field="vendor" data-price-id="${escapeHtml(row.id)}" value="${escapeHtml(row.vendor || row.source || "")}" placeholder="Vendor">
      <button type="button" data-price-save="${escapeHtml(row.id)}">Save</button>
      <button type="button" data-price-cancel="${escapeHtml(row.id)}">Cancel</button>
    </div>
  `;
}

function cssIdentifier(value) {
  if (window.CSS && typeof window.CSS.escape === "function") return window.CSS.escape(value);
  return String(value).replace(/["\\]/g, "\\$&");
}

function savePriceLineEdit(id) {
  const existing = priceDatabaseRows().find((row) => row.id === id);
  if (!existing) return;
  const fieldValue = (field) => {
    const input = document.querySelector(`[data-price-id="${cssIdentifier(id)}"][data-price-field="${field}"]`);
    return input ? input.value.trim() : "";
  };
  const price = parseMoney(fieldValue("defaultPrice"));
  const updated = {
    ...(existing.readonly ? {} : existing),
    id: existing.readonly ? `custom-${makeCrmId("price")}` : existing.id,
    sourceId: existing.readonly ? existing.id : existing.sourceId,
    product: fieldValue("product") || existing.product,
    category: fieldValue("category") || "Custom",
    unit: fieldValue("unit") || "each",
    vendor: fieldValue("vendor"),
    source: fieldValue("vendor"),
    priceLow: price,
    priceHigh: price,
    defaultPrice: price,
    lastChecked: new Date().toISOString().slice(0, 10),
  };
  if (!updated.product || !updated.defaultPrice) {
    window.alert("Add an item name and price first.");
    return;
  }
  const index = crmPriceRows.findIndex((row) => row.id === id);
  if (index >= 0) {
    crmPriceRows[index] = updated;
  } else {
    crmPriceRows.unshift(updated);
  }
  editingPriceId = "";
  savePriceRows();
  renderPriceDatabase();
}

function addPriceLine() {
  const product = $("crmPriceProduct").value.trim();
  const price = parseMoney($("crmPriceAmount").value);
  if (!product || !price) {
    window.alert("Add an item name and price first.");
    return;
  }
  const vendor = $("crmPriceVendor").value.trim();
  crmPriceRows.unshift({
    id: `custom-${makeCrmId("price")}`,
    product,
    category: $("crmPriceCategory").value.trim() || "Custom",
    unit: $("crmPriceUnit").value.trim() || "each",
    vendor,
    source: vendor,
    priceLow: price,
    priceHigh: price,
    defaultPrice: price,
    lastChecked: new Date().toISOString().slice(0, 10),
  });
  savePriceRows();
  ["crmPriceProduct", "crmPriceAmount", "crmPriceUnit", "crmPriceCategory", "crmPriceVendor"].forEach((id) => {
    $(id).value = "";
  });
  renderPriceDatabase();
}

function deletePriceLine(id) {
  const row = priceDatabaseRows().find((entry) => entry.id === id);
  if (!row) return;
  const confirmed = window.confirm(`Delete ${row.product || "this price line"} from the price database?`);
  if (!confirmed) return;
  crmPriceRows = crmPriceRows.filter((entry) => entry.id !== id);
  if (row.readonly || row.sourceId) {
    crmDeletedPriceIds = Array.from(new Set([...crmDeletedPriceIds, row.sourceId || row.id]));
    saveDeletedPriceIds();
  }
  savePriceRows();
  renderPriceDatabase();
}

function invoiceLineItemsFromEstimate(file) {
  const items = Array.isArray(file?.editableEstimate?.lineItems) ? file.editableEstimate.lineItems : [];
  const rows = items
    .filter((item) => String(item.name || "").trim())
    .map((item) => ({
      description: String(item.name || "").trim(),
      qty: item.type === "subline" ? "" : (item.qty || "1"),
      total: item.type === "subline" ? "" : ((Number(item.qty) || 1) * (Number(item.price) || 0) || ""),
      type: item.type || "item",
    }));
  if (rows.length) return rows;
  return [{ description: file?.projectType || "Project total", qty: "1", total: Number(file?.estimateTotal) || 0, type: "item" }];
}

function invoiceData(file) {
  const existing = file.invoice || {};
  const rows = Array.isArray(existing.rows) && existing.rows.length ? existing.rows : invoiceLineItemsFromEstimate(file);
  return {
    date: existing.date || todayIso(0),
    title: existing.title || "Invoice",
    billTo: existing.billTo || file.clientName || "Client",
    phone: existing.phone || file.clientPhone || "",
    email: existing.email || file.clientEmail || "",
    address: existing.address || file.projectAddress || "",
    projectNumber: existing.projectNumber || file.fileNumber || "",
    notes: existing.notes || file.editableEstimate?.notes || "",
    rows,
    total: existing.total !== undefined && existing.total !== "" ? Number(existing.total) || 0 : invoiceTotal(rows, file.estimateTotal),
  };
}

function invoiceTotal(rows, fallback = 0) {
  const total = rows.reduce((sum, row) => sum + parseMoney(row.total), 0);
  return total || Number(fallback) || 0;
}

function crmPhoneHref(value) {
  const digits = String(value || "").replace(/\D/g, "");
  return digits ? `tel:+1${digits.slice(-10)}` : "#";
}

function crmEmailHref(value) {
  return value ? `mailto:${value}` : "#";
}

function crmMapHref(value) {
  return value ? `https://maps.google.com/?q=${encodeURIComponent(value)}` : "#";
}

function crmCompanyAddressHtml() {
  return "2710 Del Prado Blvd S #2-184<br>Cape Coral, FL 33904";
}

function renderInvoiceView() {
  const file = normalizeCrmFile(activeFile());
  const paper = $("crmInvoicePaper");
  if (!paper) return;
  if (!file) {
    paper.innerHTML = `<p class="crm-empty-state">Select a customer file to create an invoice.</p>`;
    $("crmTogglePaidStamp").textContent = "Add Paid Stamp";
    return;
  }
  const invoice = invoiceData(file);
  const estimateTotal = Number(invoice.total) || invoiceTotal(invoice.rows, file.estimateTotal);
  const paid = file.paidInFull === "Yes" || file.invoicePaid === "Yes";
  $("crmTogglePaidStamp").textContent = paid ? "Remove Paid Stamp" : "Add Paid Stamp";
  paper.innerHTML = `
    <div class="simple-sheet-header">
      <div class="logo-card">
        <img src="assets/d2-logo.png" alt="D2 Carpentry and Design logo">
      </div>
      <div class="simple-title">
        <div class="brand-title-lockup">
          <h2>D2 Carpentry & Design</h2>
          <p>-Crafting Your Vision One Nail At A Time-</p>
        </div>
      </div>
      <div class="header-estimate-info">
        <span class="header-estimate-number">${escapeHtml(invoice.projectNumber || "")}</span>
        <div class="estimate-title-line">
          <h3 class="crm-inline-edit crm-invoice-title-input" data-invoice-field="title" contenteditable="true" aria-label="Invoice title">${escapeHtml(invoice.title || "Invoice")}</h3>
        </div>
        <dl>
          <div><dt>Date</dt><dd class="crm-inline-edit" data-invoice-field="date" contenteditable="true" aria-label="Invoice date">${escapeHtml(invoice.date || todayIso(0))}</dd></div>
          <div><dt>Office</dt><dd><a href="tel:+12394698555">(239) 469-8555</a></dd></div>
          <div><dt>Address</dt><dd>${crmCompanyAddressHtml()}</dd></div>
          <div><dt>Email</dt><dd><a href="mailto:D2CarpentryandDesign@gmail.com">D2CarpentryandDesign@gmail.com</a></dd></div>
        </dl>
      </div>
    </div>
    <section class="client-block crm-invoice-client-block">
      <div>
        <span>Client Information</span>
        <strong class="crm-inline-edit" data-invoice-field="billTo" contenteditable="true" aria-label="Bill to">${escapeHtml(invoice.billTo)}</strong>
        <p><span class="crm-inline-edit" data-invoice-field="phone" contenteditable="true" aria-label="Invoice phone">${escapeHtml(invoice.phone)}</span></p>
        <p><span class="crm-inline-edit" data-invoice-field="email" contenteditable="true" aria-label="Invoice email">${escapeHtml(invoice.email)}</span></p>
        <p><span class="crm-inline-edit" data-invoice-field="address" contenteditable="true" aria-label="Invoice address">${escapeHtml(invoice.address)}</span></p>
        <span class="crm-invoice-project-number crm-inline-edit" data-invoice-field="projectNumber" contenteditable="true" aria-label="Project number">${escapeHtml(invoice.projectNumber)}</span>
      </div>
    </section>
    <table>
      <colgroup>
        <col class="description-column">
        <col class="qty-column">
        <col class="total-column">
      </colgroup>
      <thead>
        <tr>
          <th>Description</th>
          <th>Qty</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${invoice.rows.map((item, index) => {
          return `
            <tr class="${item.type === "subline" ? "subline-preview-row crm-invoice-subline" : "description-preview-row"}">
              <td class="crm-inline-edit" data-invoice-row="${index}" data-invoice-row-field="description" contenteditable="true">${escapeHtml(item.description || "Project total")}</td>
              <td class="crm-inline-edit" data-invoice-row="${index}" data-invoice-row-field="qty" contenteditable="true">${escapeHtml(item.qty || "")}</td>
              <td class="crm-inline-edit" data-invoice-row="${index}" data-invoice-row-field="total" contenteditable="true">${escapeHtml(item.total || "")}</td>
            </tr>
          `;
        }).join("")}
      </tbody>
    </table>
    <div class="totals crm-invoice-total">
      ${paid ? `<strong class="crm-paid-stamp">PAID IN FULL</strong>` : ""}
      <div class="grand-total">
        <span>Total</span>
        <strong class="crm-inline-edit" data-invoice-field="total" contenteditable="true" aria-label="Invoice total">${escapeHtml(estimateTotal || "")}</strong>
      </div>
    </div>
    <div class="notes crm-invoice-notes">
      <span>Notes</span>
      <p class="crm-inline-edit" data-invoice-field="notes" contenteditable="true" aria-label="Invoice notes">${escapeHtml(invoice.notes)}</p>
    </div>
    <footer class="estimate-footer">
      <span><strong>Office:</strong> (239) 469-8555</span>
      <span><strong>Email:</strong> D2CarpentryandDesign@gmail.com</span>
      <span class="footer-address"><strong>Address:</strong> <span>${crmCompanyAddressHtml()}</span></span>
    </footer>
  `;
}

function saveInvoiceStatus() {
  const file = normalizeCrmFile(activeFile());
  if (!file) return;
  const paid = file.invoicePaid === "Yes" || file.paidInFull === "Yes" ? "Yes" : "No";
  const oldValue = file.invoicePaid || "No";
  const rowCount = document.querySelectorAll("[data-invoice-row-field='description']").length;
  const rows = Array.from({ length: rowCount }, (_, index) => {
    const descriptionField = document.querySelector(`[data-invoice-row="${index}"][data-invoice-row-field="description"]`);
    return {
      description: textFieldValue(descriptionField),
      qty: textFieldValue(document.querySelector(`[data-invoice-row="${index}"][data-invoice-row-field="qty"]`)),
      total: parseMoney(textFieldValue(document.querySelector(`[data-invoice-row="${index}"][data-invoice-row-field="total"]`))),
      type: descriptionField?.closest("tr")?.classList.contains("crm-invoice-subline") ? "subline" : "item",
    };
  }).filter((row) => row.description || row.qty || row.total);
  const fieldValue = (field) => textFieldValue(document.querySelector(`[data-invoice-field="${field}"]`));
  file.invoice = {
    title: fieldValue("title") || "Invoice",
    date: fieldValue("date") || todayIso(0),
    billTo: fieldValue("billTo"),
    phone: fieldValue("phone"),
    email: fieldValue("email"),
    address: fieldValue("address"),
    projectNumber: fieldValue("projectNumber") || file.fileNumber,
    notes: fieldValue("notes"),
    rows,
    total: parseMoney(fieldValue("total")) || invoiceTotal(rows, file.estimateTotal),
  };
  file.estimateTotal = Number(file.invoice.total) || invoiceTotal(rows, file.estimateTotal);
  file.invoicePaid = paid;
  file.paidInFull = paid;
  file.invoiceSent = "Yes";
  file.invoiceStatus = paid === "Yes" ? "Paid" : "Sent";
  if (oldValue !== paid) addSystemNote(file, `Invoice paid status changed to ${paid}.`);
  saveCrmFiles();
  renderInvoiceView();
  renderCrm();
}

function textFieldValue(element) {
  if (!element) return "";
  return ("value" in element ? element.value : element.textContent || "").trim();
}

function togglePaidStamp() {
  const file = normalizeCrmFile(activeFile());
  if (!file) return;
  saveInvoiceStatus();
  const isPaid = file.invoicePaid === "Yes" || file.paidInFull === "Yes";
  file.invoicePaid = isPaid ? "No" : "Yes";
  file.paidInFull = file.invoicePaid;
  file.invoiceStatus = file.invoicePaid === "Yes" ? "Paid" : "Sent";
  addSystemNote(file, file.invoicePaid === "Yes" ? "Paid in full stamp added to invoice." : "Paid in full stamp removed from invoice.");
  saveCrmFiles();
  renderInvoiceView();
  renderCrm();
}

function addInvoiceLine() {
  const file = normalizeCrmFile(activeFile());
  if (!file) return;
  saveInvoiceStatus();
  const freshFile = normalizeCrmFile(activeFile());
  freshFile.invoice = freshFile.invoice || invoiceData(freshFile);
  freshFile.invoice.rows = [...(freshFile.invoice.rows || []), { description: "", qty: "", total: "", type: "item" }];
  saveCrmFiles();
  renderInvoiceView();
}

function invoiceFileName(file) {
  const safeClient = String(file?.clientName || "D2 Invoice").replace(/[^a-z0-9]+/gi, " ").trim();
  const safeNumber = String(file?.fileNumber || "").replace(/[^a-z0-9-]+/gi, "");
  return `${safeClient}${safeNumber ? ` - ${safeNumber}` : ""} Invoice.pdf`;
}

function getCrmJsPdf() {
  return window.jspdf && window.jspdf.jsPDF ? window.jspdf.jsPDF : null;
}

function getCrmHtml2Canvas() {
  return window.html2canvas || null;
}

async function waitForCrmPdfAssets(host) {
  const images = Array.from(host.querySelectorAll("img"));
  await Promise.all(images.map((image) => {
    if (image.complete) return Promise.resolve();
    return new Promise((resolve) => {
      image.addEventListener("load", resolve, { once: true });
      image.addEventListener("error", resolve, { once: true });
    });
  }));
}

function prepareInvoicePdfClone(source) {
  const clone = source.cloneNode(true);
  clone.querySelectorAll("[contenteditable]").forEach((element) => {
    element.removeAttribute("contenteditable");
  });
  clone.querySelectorAll("input, textarea").forEach((field) => {
    const replacement = document.createElement(field.matches("[data-invoice-field='title']") ? "h3" : "span");
    replacement.className = field.className || "";
    replacement.textContent = field.type === "date" && field.value ? displayDate(field.value) : field.value;
    if (field.matches("[data-invoice-field='total']")) {
      replacement.textContent = crmCurrency.format(parseMoney(field.value));
      replacement.classList.add("crm-invoice-total-text");
    }
    if (field.tagName === "TEXTAREA") {
      replacement.innerHTML = escapeHtml(field.value).replace(/\n/g, "<br>");
    }
    field.replaceWith(replacement);
  });
  return clone;
}

async function createInvoicePdfDocument(file, sourceElement) {
  const JsPdf = getCrmJsPdf();
  const html2canvas = getCrmHtml2Canvas();
  if (!JsPdf || !html2canvas || !sourceElement) return null;
  const host = document.createElement("div");
  host.className = "pdf-render-host";
  host.style.position = "fixed";
  host.style.left = "-10000px";
  host.style.top = "0";
  host.style.width = `${sourceElement.getBoundingClientRect().width || 820}px`;
  host.style.background = "#ffffff";
  host.style.pointerEvents = "none";
  host.appendChild(prepareInvoicePdfClone(sourceElement));
  document.body.appendChild(host);
  try {
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    await waitForCrmPdfAssets(host);
    const source = host.firstElementChild;
    const sourceRect = source.getBoundingClientRect();
    const canvas = await html2canvas(source, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
      windowWidth: Math.ceil(source.scrollWidth || sourceRect.width),
      windowHeight: Math.ceil(source.scrollHeight || sourceRect.height),
    });
    const doc = new JsPdf({ unit: "mm", format: "letter" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 8.9;
    const imageWidth = pageWidth - margin * 2;
    const pageImageHeight = pageHeight - margin * 2;
    const pageCanvasHeight = Math.floor((pageImageHeight * canvas.width) / imageWidth);
    const pageCount = Math.max(1, Math.ceil(canvas.height / pageCanvasHeight));
    for (let pageIndex = 0; pageIndex < pageCount; pageIndex += 1) {
      if (pageIndex > 0) doc.addPage("letter");
      const sliceY = pageIndex * pageCanvasHeight;
      const sliceHeight = Math.min(pageCanvasHeight, canvas.height - sliceY);
      const sliceCanvas = document.createElement("canvas");
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = sliceHeight;
      const context = sliceCanvas.getContext("2d");
      context.drawImage(canvas, 0, sliceY, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
      const sliceImageHeight = (sliceHeight * imageWidth) / canvas.width;
      doc.addImage(sliceCanvas.toDataURL("image/png"), "PNG", margin, margin, imageWidth, sliceImageHeight, undefined, "FAST");
    }
    return doc;
  } catch (error) {
    console.warn("Invoice visual PDF generator failed; using simple PDF fallback.", error);
    return null;
  } finally {
    host.remove();
  }
}

function createSimpleInvoicePdfDocument(file) {
  const JsPdf = getCrmJsPdf();
  if (!JsPdf) return null;
  const invoice = invoiceData(file);
  const doc = new JsPdf({ unit: "mm", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let y = 18;
  const addPageIfNeeded = (needed = 10) => {
    if (y + needed < pageHeight - margin) return;
    doc.addPage("letter");
    y = margin;
  };
  const writeWrapped = (text, x, maxWidth, lineHeight = 5) => {
    const lines = doc.splitTextToSize(String(text || ""), maxWidth);
    lines.forEach((line) => {
      addPageIfNeeded(lineHeight);
      doc.text(line, x, y);
      y += lineHeight;
    });
  };

  doc.setFont("helvetica", "bold");
  doc.setTextColor(13, 74, 145);
  doc.setFontSize(20);
  doc.text("D2 Carpentry & Design", margin, y);
  doc.setFontSize(22);
  doc.text("INVOICE", pageWidth - margin, y, { align: "right" });
  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(75, 85, 99);
  doc.setFontSize(9);
  doc.text("-Crafting Your Vision One Nail At A Time-", margin, y);
  doc.text(invoice.projectNumber || file.fileNumber || "", pageWidth - margin, y, { align: "right" });
  y += 10;
  doc.setDrawColor(13, 74, 145);
  doc.setLineWidth(1.2);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  doc.setTextColor(17, 24, 39);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Client Information", margin, y);
  doc.text("Invoice Details", pageWidth - 72, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const clientStartY = y;
  writeWrapped(invoice.billTo || file.clientName || "Client", margin, 80);
  writeWrapped(invoice.phone || file.clientPhone || "", margin, 80);
  writeWrapped(invoice.email || file.clientEmail || "", margin, 80);
  writeWrapped(invoice.address || file.projectAddress || "", margin, 80);
  const afterClientY = y;
  y = clientStartY;
  doc.text(displayDate(invoice.date || todayIso(0)), pageWidth - 72, y);
  y += 5;
  writeWrapped(`Project # ${invoice.projectNumber || file.fileNumber || ""}`, pageWidth - 72, 58);
  y = Math.max(afterClientY, y) + 8;

  doc.setFillColor(13, 74, 145);
  doc.rect(margin, y - 5, pageWidth - margin * 2, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("Description", margin + 2, y);
  doc.text("Qty", pageWidth - 52, y, { align: "right" });
  doc.text("Total", pageWidth - margin - 2, y, { align: "right" });
  y += 7;

  doc.setTextColor(17, 24, 39);
  doc.setFont("helvetica", "normal");
  (invoice.rows || []).forEach((row) => {
    addPageIfNeeded(14);
    const rowY = y;
    const descriptionLines = doc.splitTextToSize(String(row.description || ""), 112);
    descriptionLines.forEach((line, index) => {
      doc.text(line, row.type === "subline" ? margin + 7 : margin + 2, y + index * 5);
    });
    doc.text(String(row.qty || ""), pageWidth - 52, rowY, { align: "right" });
    doc.text(row.total ? crmCurrency.format(Number(row.total) || 0) : "", pageWidth - margin - 2, rowY, { align: "right" });
    y += Math.max(7, descriptionLines.length * 5 + 2);
    doc.setDrawColor(215, 220, 229);
    doc.line(margin, y - 2, pageWidth - margin, y - 2);
  });

  y += 8;
  const total = Number(invoice.total) || invoiceTotal(invoice.rows, file.estimateTotal);
  if (file.invoicePaid === "Yes" || file.paidInFull === "Yes") {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(185, 28, 28);
    doc.setFontSize(13);
    doc.text("PAID IN FULL", pageWidth - margin, y, { align: "right" });
    y += 7;
  }
  doc.setFont("helvetica", "bold");
  doc.setTextColor(13, 74, 145);
  doc.setFontSize(14);
  doc.text("Total", pageWidth - 65, y);
  doc.text(crmCurrency.format(total), pageWidth - margin, y, { align: "right" });
  y += 12;

  if (invoice.notes) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(13, 74, 145);
    doc.setFontSize(10);
    doc.text("Notes", margin, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(17, 24, 39);
    writeWrapped(invoice.notes, margin, pageWidth - margin * 2);
  }

  y = Math.max(y + 10, pageHeight - 25);
  doc.setDrawColor(215, 220, 229);
  doc.line(margin, y - 5, pageWidth - margin, y - 5);
  doc.setFontSize(8);
  doc.setTextColor(75, 85, 99);
  doc.text("Office: (239) 469-8555", margin, y);
  doc.text("Email: D2CarpentryandDesign@gmail.com", pageWidth / 2, y, { align: "center" });
  doc.text("Address: 2710 Del Prado Blvd S #2-184, Cape Coral, FL 33904", pageWidth - margin, y, { align: "right" });
  return doc;
}

async function saveInvoicePdf() {
  const file = normalizeCrmFile(activeFile());
  if (!file) return;
  saveInvoiceStatus();
  const sourceElement = $("crmInvoicePaper");
  const doc = await createInvoicePdfDocument(file, sourceElement);
  if (doc) {
    doc.save(invoiceFileName(file));
    return;
  }
  const simpleDoc = createSimpleInvoicePdfDocument(file);
  if (simpleDoc) {
    simpleDoc.save(invoiceFileName(file));
    return;
  }
  window.alert("The browser could not create the invoice PDF. Try refreshing the page, then click Save PDF again.");
}

async function emailInvoice() {
  const file = normalizeCrmFile(activeFile());
  if (!file) return;
  saveInvoiceStatus();
  const invoice = invoiceData(file);
  const total = crmCurrency.format(Number(invoice.total) || invoiceTotal(invoice.rows, file.estimateTotal));
  const subjectText = "Invoice - D2 Carpentry & Design";
  const bodyText = `Hi ${invoice.billTo || file.clientName || ""},\n\nPlease see your invoice from D2 Carpentry & Design.\n\nProject #: ${invoice.projectNumber || file.fileNumber || ""}\nTotal: ${total}\n\nThank you,\nD2 Carpentry & Design`;
  const sourceElement = $("crmInvoicePaper");
  const doc = await createInvoicePdfDocument(file, sourceElement) || createSimpleInvoicePdfDocument(file);
  if (doc && navigator.canShare && navigator.share && window.File) {
    const pdfFile = new File([doc.output("blob")], invoiceFileName(file), { type: "application/pdf" });
    if (navigator.canShare({ files: [pdfFile] })) {
      try {
        await navigator.share({
          files: [pdfFile],
          title: subjectText,
          text: bodyText,
        });
        return;
      } catch (error) {
        // If sharing is cancelled or blocked, continue with the save + email draft fallback.
      }
    }
  }
  if (doc) {
    doc.save(invoiceFileName(file));
    window.alert("The invoice PDF was saved. Your email draft will open next; attach the saved PDF to send it.");
  }
  const subject = encodeURIComponent(subjectText);
  const body = encodeURIComponent(bodyText);
  window.location.href = `mailto:${encodeURIComponent(invoice.email || file.clientEmail || "")}?subject=${subject}&body=${body}`;
}

function switchCrmView(view) {
  const showRevenue = view === "revenue";
  const showInvoice = view === "invoice";
  const showPrices = view === "prices";
  document.querySelectorAll(".crm-dashboard-view").forEach((section) => {
    section.hidden = showRevenue || showInvoice || showPrices;
  });
  $("crmRevenueView").hidden = !showRevenue;
  $("crmInvoiceView").hidden = !showInvoice;
  $("crmPriceView").hidden = !showPrices;
  document.querySelectorAll("[data-crm-view]").forEach((button) => {
    button.classList.toggle("active", button.dataset.crmView === view);
  });
  if (showInvoice) renderInvoiceView();
  if (showPrices) renderPriceDatabase();
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
    activateCrmFilter(button.dataset.crmFilter);
    renderCrm();
  });
});

$("crmFileFilter").addEventListener("change", () => {
  activateCrmFilter($("crmFileFilter").value);
  renderCrm();
});
$("crmSearchFile").addEventListener("click", searchCrmFile);
$("crmFileSearch").addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    searchCrmFile();
  }
});
$("crmEditEstimateTotal").addEventListener("click", toggleEstimateAmountEdit);
$("crmSaveEstimateAmount").addEventListener("click", saveEstimateAmountEdit);
$("crmEditMaterialTotal").addEventListener("click", toggleMaterialAmountEdit);
$("crmSaveMaterialAmount").addEventListener("click", saveMaterialAmountEdit);
$("crmAddPriceLine").addEventListener("click", addPriceLine);
$("crmPriceSearch").addEventListener("input", renderPriceDatabase);
$("crmPriceSort").addEventListener("change", renderPriceDatabase);
$("crmTogglePaidStamp").addEventListener("click", togglePaidStamp);
$("crmSaveInvoiceStatus").addEventListener("click", saveInvoiceStatus);
$("crmSaveInvoicePdf").addEventListener("click", () => {
  saveInvoicePdf().catch(() => window.alert("The invoice PDF could not be created. Try refreshing the page, then click Save PDF again."));
});
$("crmEmailInvoice").addEventListener("click", () => {
  emailInvoice().catch(() => window.alert("The invoice email could not be opened. Save the PDF first, then attach it manually."));
});
$("crmNewFile").addEventListener("click", newCrmFile);
$("crmImportApprovedEstimate").addEventListener("click", () => $("crmApprovedEstimateUpload").click());
$("crmApprovedEstimateUpload").addEventListener("change", (event) => {
  importApprovedEstimateFile(event.target.files[0]);
  event.target.value = "";
});
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
  file.fileStatus = "Job Lost / Closed";
  file.timeline = [...(file.timeline || []), "File archived as Job Lost / Closed"];
  activateCrmFilter("archive");
  saveCrmFiles();
  renderCrm();
});
$("crmDeleteFile").addEventListener("click", deleteActiveFile);
$("crmOpenEstimate").addEventListener("click", () => openActiveEstimate(""));
$("crmOpenAssignment").addEventListener("click", () => openActiveEstimate("#assignment"));
$("crmOpenInvoice").addEventListener("click", () => switchCrmView("invoice"));
$("crmImportRevenue").addEventListener("click", importRevenueRows);
$("crmAddRevenueRow").addEventListener("click", addRevenueRow);
$("crmUploadEstimateFile").addEventListener("click", () => $("crmEstimateFileUpload").click());
$("crmEstimateFileUpload").addEventListener("change", (event) => {
  uploadEstimateToRevenue(event.target.files[0]);
  event.target.value = "";
});
document.querySelectorAll("[data-crm-view]").forEach((button) => {
  button.addEventListener("click", () => switchCrmView(button.dataset.crmView));
});

$("crmFileStatus").addEventListener("change", () => {
  renderStatusDetailOptions(activeFile());
  handleStatusWorkflow();
});
$("crmStatusDetail").addEventListener("change", handleStatusWorkflow);

document.querySelectorAll("input, select, textarea").forEach((element) => {
  if (["crmFileStatus", "crmStatusDetail", "crmEstimateAmountInput", "crmMaterialAmountInput"].includes(element.id)) return;
  element.addEventListener("change", (event) => {
    handleCrmControlWorkflow(event);
    saveActiveFile();
    renderCrm();
  });
});

applyFreshDashboardReset();
switchCrmView("dashboard");
renderCrm();
