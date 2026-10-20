const Ledger = (() => {
  // Shared data model and display configuration.
  const KEY = "ledgerly-transactions";
  const categories = [
    "Housing",
    "Food & dining",
    "Transportation",
    "Shopping",
    "Bills & utilities",
    "Health",
    "Entertainment",
    "Education",
    "Salary",
    "Freelance",
    "Investment",
    "Other",
  ];
  let transactions = [];
  const $ = (id) => document.getElementById(id);
  const money = (v) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(v);
  const dateText = (d) =>
    new Date(d + "T12:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  // LocalStorage persistence.
  function load() {
    try {
      transactions = JSON.parse(localStorage.getItem(KEY)) || [];
    } catch {
      transactions = [];
    }
    return transactions;
  }
  function save() {
    localStorage.setItem(KEY, JSON.stringify(transactions));
  }
  function totals() {
    return transactions.reduce(
      (a, t) => {
        a[t.type] += Number(t.amount);
        a.count++;
        return a;
      },
      { income: 0, expense: 0, count: 0 },
    );
  }
  // Small reusable status notification.
  function showToast(message) {
    const el = $("toast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
  }
  // Dashboard statistics and recent-activity rendering.
  function updateDashboard() {
    const total = totals();
    if ($("balanceAmount"))
      $("balanceAmount").textContent = money(total.income - total.expense);
    if ($("incomeAmount")) $("incomeAmount").textContent = money(total.income);
    if ($("expenseAmount"))
      $("expenseAmount").textContent = money(total.expense);
    if ($("transactionCount")) $("transactionCount").textContent = total.count;
    if ($("incomeMeta"))
      $("incomeMeta").textContent = total.income
        ? "Money received"
        : "No income recorded";
    if ($("expenseMeta"))
      $("expenseMeta").textContent = total.expense
        ? "Money spent"
        : "No expenses recorded";
    renderRecent();
    if (window.LedgerCharts) LedgerCharts.update(transactions);
  }
  function iconFor(category) {
    return (
      {
        "Food & dining": "cup-hot",
        Transportation: "car-front",
        Shopping: "bag",
        Housing: "house",
        Salary: "cash-stack",
        Freelance: "laptop",
        "Bills & utilities": "lightning-charge",
        Health: "heart-pulse",
        Entertainment: "film",
      }[category] || "receipt"
    );
  }
  function renderRecent() {
    const el = $("recentTransactions");
    if (!el) return;
    const recent = [...transactions]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5);
    el.innerHTML = recent.length
      ? recent
          .map(
            (t) =>
              `<div class="transaction-row"><div class="transaction-avatar"><i class="bi bi-${iconFor(t.category)}"></i></div><div class="transaction-info"><strong>${escape(t.title)}</strong><span>${escape(t.category)} &middot; ${dateText(t.date)}</span></div><div class="transaction-value ${t.type}">${t.type === "income" ? "+" : "-"}${money(t.amount)}</div></div>`,
          )
          .join("")
      : '<div class="empty-state"><i class="bi bi-receipt"></i><p>Your latest transactions will appear here.</p></div>';
  }
  function escape(value) {
    const x = document.createElement("span");
    x.textContent = value;
    return x.innerHTML;
  }
  function updateCategoryOptions() {
    const select = $("category");
    if (!select) return;
    select.innerHTML = categories
      .map((c) => `<option value="${c}">${c}</option>`)
      .join("");
  }
  function resetForm() {
    const form = $("transactionForm");
    if (!form) return;
    form.reset();
    form.classList.remove("was-validated");
    $("transactionId").value = "";
    $("date").value = new Date().toISOString().slice(0, 10);
    $("transactionModalTitle").textContent = "Add transaction";
  }
  function saveFromForm(e) {
    e.preventDefault();
    const form = $("transactionForm");
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }
    const entry = {
      id: $("transactionId").value || String(Date.now()),
      title: $("title").value.trim(),
      amount: Number($("amount").value),
      type: $("type").value,
      category: $("category").value,
      date: $("date").value,
      description: $("description").value.trim(),
    };
    const existing = transactions.findIndex((t) => t.id === entry.id);
    if (existing >= 0) transactions[existing] = entry;
    else transactions.unshift(entry);
    save();
    bootstrap.Modal.getInstance($("transactionModal")).hide();
    resetForm();
    updateDashboard();
    document.dispatchEvent(new CustomEvent("ledger:changed"));
    showToast(existing >= 0 ? "Transaction updated" : "Transaction added");
  }
  // Transaction lifecycle actions.
  function edit(id) {
    const t = transactions.find((x) => x.id === id);
    if (!t) return;
    $("transactionId").value = t.id;
    $("title").value = t.title;
    $("amount").value = t.amount;
    $("type").value = t.type;
    $("category").value = t.category;
    $("date").value = t.date;
    $("description").value = t.description || "";
    $("transactionModalTitle").textContent = "Edit transaction";
    new bootstrap.Modal($("transactionModal")).show();
  }
  function remove(id) {
    const t = transactions.find((x) => x.id === id);
    if (!t || !confirm(`Delete "${t.title}"?`)) return;
    transactions = transactions.filter((x) => x.id !== id);
    save();
    updateDashboard();
    document.dispatchEvent(new CustomEvent("ledger:changed"));
    showToast("Transaction deleted");
  }
  function clearAll() {
    if (
      !transactions.length ||
      !confirm("Clear all transactions? This cannot be undone.")
    )
      return;
    transactions = [];
    save();
    updateDashboard();
    document.dispatchEvent(new CustomEvent("ledger:changed"));
    showToast("All transaction data cleared");
  }
  // Page-level event listeners and initial state restoration.
  function init() {
    load();
    updateCategoryOptions();
    updateDashboard();
    $("date") && ($("date").value = new Date().toISOString().slice(0, 10));
    $("transactionForm")?.addEventListener("submit", saveFromForm);
    $("transactionModal")?.addEventListener("hidden.bs.modal", resetForm);
    document.querySelectorAll("[data-theme-toggle]").forEach((b) =>
      b.addEventListener("click", () => {
        document.body.classList.toggle("dark");
        localStorage.setItem(
          "ledgerly-theme",
          document.body.classList.contains("dark") ? "dark" : "light",
        );
      }),
    );
    if (localStorage.getItem("ledgerly-theme") === "dark")
      document.body.classList.add("dark");
    $("menuButton")?.addEventListener("click", () =>
      $("sidebar").classList.toggle("open"),
    );
    window.addEventListener("resize", () =>
      window.LedgerCharts?.update(transactions),
    );
  }
  return {
    init,
    get: () => transactions,
    money,
    dateText,
    escape,
    edit,
    remove,
    clearAll,
    updateDashboard,
    categories,
  };
})();
document.addEventListener("DOMContentLoaded", Ledger.init);
