const crmCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const CRM_STORAGE_KEY = "d2CrmDemoFiles";
const CRM_REVENUE_STORAGE_KEY = "d2CrmRevenueRows";
const CRM_RESET_VERSION_KEY = "d2CrmFreshDashboardVersion";
const CRM_FRESH_DASHBOARD_VERSION = "approved-estimate-start-v1";

const CRM_STATUS_DESCRIPTIONS = {
  "New Lead": "Inquiry received from your website, social media, or local referral.",
  "Initial Contact": "You have spoken to the client and are actively qualifying their project scope.",
  "Contact Pending": "A call was made. Confirm whether email or text contact was also sent.",
  "Inspection Scheduled": "The date is locked in the calendar to visit the job site and take measurements.",
  "Inspection Pending": "Waiting on the owner or waiting on the estimator.",
  "Inspection Completed": "You met the client, took site dimensions, and discussed wood types/finishes.",
  "Pending Estimate": "You are calculating material costs, lumber yard pricing, and labor hours.",
  "Estimate Sent": "The quote is in the customer's hands; awaiting approval or negotiation.",
  "Job Won": "The customer approved the job. Confirm whether the deposit has been secured.",
  "In Negotiation": "Customer wants to think it over. Set a follow-up call date.",
  "In Progress": "Job has started. Confirm expected completion date and midpoint deposit.",
  "Work Completed": "Work is complete. Confirm closing call, review request, and final payment.",
  "Closing Call / Invoice Sent": "Final invoice is delivered and remaining balance is being secured.",
  "Closed / Paid": "Job folder is archived and contact info is saved for future marketing.",
  "Job Lost / Closed": "Archive the file and save contact info for future marketing.",
};

const crmFields = [
  "clientName",
  "clientPhone",
  "clientEmail",
  "projectAddress",
  "leadSource",
  "fileStatus",
  "projectType",
  "contactEmailSent",
  "contactTextSent",
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
  "initialDeposit",
  "midpointDeposit",
  "paidInFull",
  "closingCallCompleted",
  "finalPaymentSecured",
  "finalPaymentAmount",
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
  file.invoiceStatus = file.invoiceStatus || (file.fileStatus === "Closed / Paid" ? "Paid" : "Not Created");
  file.reviewStatus = file.reviewStatus || (file.fileStatus === "Closed / Paid" ? "Requested" : "Not Ready");
  file.depositSecured = file.depositSecured || (Number(file.depositTotal) > 0 ? "Yes" : "No");
  file.initialDeposit = file.initialDeposit === undefined ? file.depositTotal || "" : file.initialDeposit;
  file.midpointDeposit = file.midpointDeposit === undefined ? "" : file.midpointDeposit;
  file.paidInFull = file.paidInFull || (file.invoiceStatus === "Paid" || file.fileStatus === "Closed / Paid" ? "Yes" : "No");
  file.contactEmailSent = file.contactEmailSent || "No";
  file.contactTextSent = file.contactTextSent || "No";
  file.followUpDate = file.followUpDate || "";
  file.anticipatedCompletionDate = file.anticipatedCompletionDate || "";
  file.closingCallCompleted = file.closingCallCompleted || "No";
  file.finalPaymentSecured = file.finalPaymentSecured || "No";
  file.finalPaymentAmount = file.finalPaymentAmount === undefined ? "" : file.finalPaymentAmount;
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
  if (["Inspection Scheduled", "Inspection Pending", "Inspection Completed"].includes(status)) return "Inspection";
  if (["Pending Estimate", "Estimate Sent", "In Negotiation"].includes(status)) return "Estimate";
  if (["Closing Call / Invoice Sent"].includes(status)) return "Closing";
  if (["Job Lost / Closed"].includes(status)) return "Closed";
  return "Lead";
}

function inferEstimateStatus(status = "") {
  if (status === "Pending Estimate") return "Pending";
  if (status === "Estimate Sent") return "Sent";
  if (["Job Won", "In Progress", "Work Completed", "Closing Call / Invoice Sent", "Closed / Paid"].includes(status)) return "Approved";
  if (status === "Job Lost / Closed") return "Declined";
  return "Not Started";
}

function isOpenCrmFile(file) {
  return !["Job Lost / Closed", "Closed / Paid"].includes(file.fileStatus);
}

function visibleFiles() {
  const filter = $("crmFileFilter").value;
  if (filter === "all") return crmFiles.filter(isOpenCrmFile);
  if (filter === "new") return crmFiles.filter((file) => ["New Lead", "Initial Contact", "Contact Pending"].includes(file.fileStatus));
  if (filter === "estimate") return crmFiles.filter((file) => ["Pending Estimate", "Estimate Sent", "In Negotiation"].includes(file.fileStatus));
  if (filter === "inspection") return crmFiles.filter((file) => ["Inspection Scheduled", "Inspection Pending", "Inspection Completed"].includes(file.fileStatus) || file.projectStage === "Inspection" || Boolean(file.inspectionDate));
  if (filter === "won") return crmFiles.filter((file) => ["Job Won", "In Progress", "Work Completed", "Closing Call / Invoice Sent"].includes(file.fileStatus));
  if (filter === "active") return crmFiles.filter((file) => ["Job Won", "In Progress"].includes(file.fileStatus) || ["Scheduled", "In Progress"].includes(file.projectStage));
  if (filter === "review") return crmFiles.filter((file) => ["Work Completed", "Closing Call / Invoice Sent"].includes(file.fileStatus) || ["Ready to Request", "Requested"].includes(file.reviewStatus));
  if (filter === "archive") return crmFiles.filter((file) => ["Closed / Paid", "Job Lost / Closed"].includes(file.fileStatus));
  return crmFiles;
}

function renderCounts() {
  $("allFilesCount").textContent = crmFiles.filter(isOpenCrmFile).length;
  $("newLeadCount").textContent = crmFiles.filter((file) => ["New Lead", "Initial Contact", "Contact Pending"].includes(file.fileStatus)).length;
  $("pendingEstimateCount").textContent = crmFiles.filter((file) => ["Pending Estimate", "Estimate Sent", "In Negotiation"].includes(file.fileStatus)).length;
  $("inspectionCount").textContent = crmFiles.filter((file) => ["Inspection Scheduled", "Inspection Pending", "Inspection Completed"].includes(file.fileStatus) || file.projectStage === "Inspection" || Boolean(file.inspectionDate)).length;
  $("wonJobCount").textContent = crmFiles.filter((file) => ["Job Won", "In Progress", "Work Completed", "Closing Call / Invoice Sent"].includes(file.fileStatus)).length;
  $("activeJobCount").textContent = crmFiles.filter((file) => ["Job Won", "In Progress"].includes(file.fileStatus) || ["Scheduled", "In Progress"].includes(file.projectStage)).length;
  $("reviewCount").textContent = crmFiles.filter((file) => ["Work Completed", "Closing Call / Invoice Sent"].includes(file.fileStatus) || ["Ready to Request", "Requested"].includes(file.reviewStatus)).length;
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
    $("crmDepositTotal").textContent = crmCurrency.format(0);
    $("crmMidpointDepositTotal").textContent = crmCurrency.format(0);
    $("crmMaterialTotal").textContent = crmCurrency.format(0);
    $("crmBalanceTotal").textContent = crmCurrency.format(0);
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
  const estimateTotal = Number(file.estimateTotal) || 0;
  const initialDeposit = Number(file.initialDeposit) || Number(file.depositTotal) || 0;
  const midpointDeposit = Number(file.midpointDeposit) || 0;
  const paidInFull = file.paidInFull === "Yes";
  const securedTotal = paidInFull ? estimateTotal : initialDeposit + midpointDeposit;
  $("crmEstimateTotal").textContent = crmCurrency.format(estimateTotal);
  $("crmDepositTotal").textContent = crmCurrency.format(initialDeposit);
  $("crmMidpointDepositTotal").textContent = crmCurrency.format(midpointDeposit);
  $("crmMaterialTotal").textContent = crmCurrency.format(Number(file.materialTotal) || 0);
  $("crmBalanceTotal").textContent = crmCurrency.format(Math.max(estimateTotal - securedTotal, 0));
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

function handleStatusWorkflow() {
  const file = normalizeCrmFile(activeFile());
  if (!file) return;
  const status = $("crmFileStatus").value;
  $("crmStatusDescription").textContent = CRM_STATUS_DESCRIPTIONS[status] || "";

  if (["Estimate Sent", "In Negotiation"].includes(status) && !$("crmFollowUpDate").value) {
    const followUp = window.prompt("Set a follow-up date for the business calendar. Use YYYY-MM-DD.");
    if (followUp) {
      $("crmFollowUpDate").value = followUp;
      $("crmNextActionDate").value = followUp;
      $("crmNextAction").value = status === "Estimate Sent" ? "Follow up on sent estimate" : "Follow up on negotiation";
    }
  }

  if (status === "Job Won" && $("crmDepositSecured").value !== "Yes") {
    const reason = window.prompt("Deposit is not secured yet. Add a note explaining why.");
    if (reason) addSystemNote(file, `Deposit not secured at Job Won: ${reason}`);
    $("crmNextAction").value = "Secure initial deposit";
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
    if ($("crmClosingCallCompleted").value !== "Yes") $("crmNextAction").value = "Complete closing call";
    if ($("crmFinalPaymentSecured").value !== "Yes") {
      const reason = window.prompt("Final payment is not secured yet. Add a note explaining why.");
      if (reason) addSystemNote(file, `Final payment not secured at completion: ${reason}`);
    }
    if ($("crmReviewSent").value !== "Yes") {
      window.alert("Send the review request before moving this file to Closed / Paid.");
    }
  }

  if (status === "Closed / Paid") {
    $("crmPaidInFull").value = "Yes";
    $("crmFinalPaymentSecured").value = "Yes";
    $("crmReviewSent").value = "Yes";
    $("crmNextAction").value = "Archived for future marketing";
    activateCrmFilter("archive");
  }

  if (status === "Job Lost / Closed") {
    $("crmNextAction").value = "Archived for future marketing";
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
    projectType: "Other",
    projectStage: "Lead",
    contactEmailSent: "No",
    contactTextSent: "No",
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
    initialDeposit: "",
    midpointDeposit: "",
    paidInFull: "No",
    closingCallCompleted: "No",
    finalPaymentSecured: "No",
    finalPaymentAmount: "",
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
      || String(file.projectAddress || "").toLowerCase().includes(query);
  });
  if (!match) {
    window.alert("No matching project file was found.");
    return;
  }
  saveActiveFile();
  activeFileId = match.id;
  activateCrmFilter("all");
  renderCrm();
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
    projectType: data.projectType || existing?.projectType || "Other",
    projectStage: existing?.projectStage || "Lead",
    contactEmailSent: existing?.contactEmailSent || "No",
    contactTextSent: existing?.contactTextSent || "No",
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
    initialDeposit: existing?.initialDeposit === undefined ? estimateDeposit || "" : existing.initialDeposit,
    midpointDeposit: existing?.midpointDeposit || "",
    paidInFull: existing?.paidInFull || "No",
    closingCallCompleted: existing?.closingCallCompleted || "No",
    finalPaymentSecured: existing?.finalPaymentSecured || "No",
    finalPaymentAmount: existing?.finalPaymentAmount || "",
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
    projectType: "Other",
    projectStage: "Lead",
    contactEmailSent: "No",
    contactTextSent: "No",
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
    initialDeposit: "",
    midpointDeposit: "",
    paidInFull: "No",
    closingCallCompleted: "No",
    finalPaymentSecured: "No",
    finalPaymentAmount: "",
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

$("crmFileStatus").addEventListener("change", handleStatusWorkflow);

document.querySelectorAll("input, select, textarea").forEach((element) => {
  if (element.id === "crmFileStatus") return;
  element.addEventListener("change", saveActiveFile);
});

applyFreshDashboardReset();
switchCrmView("dashboard");
renderCrm();
