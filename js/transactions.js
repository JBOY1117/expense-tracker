document.addEventListener("DOMContentLoaded", () => {
  // Transaction page controls and table rendering.
  const $ = (id) => document.getElementById(id);
  const categoryFilter = $("categoryFilter");
  Ledger.categories.forEach((c) =>
    categoryFilter.insertAdjacentHTML(
      "beforeend",
      `<option value="${c}">${c}</option>`,
    ),
  );
  // Apply the current search, filters, and sort order.
  function filtered() {
    let items = [...Ledger.get()];
    const q = $("searchInput").value.toLowerCase().trim(),
      cat = categoryFilter.value,
      type = $("typeFilter").value,
      sort = $("sortSelect").value;
    items = items.filter(
      (t) =>
        (!q ||
          [t.title, t.category, t.description]
            .join(" ")
            .toLowerCase()
            .includes(q)) &&
        (cat === "all" || t.category === cat) &&
        (type === "all" || t.type === type),
    );
    items.sort((a, b) =>
      sort === "date-desc"
        ? b.date.localeCompare(a.date)
        : sort === "date-asc"
          ? a.date.localeCompare(b.date)
          : sort === "amount-desc"
            ? b.amount - a.amount
            : a.amount - b.amount,
    );
    return items;
  }
  // Render the filtered transaction collection.
  function render() {
    const items = filtered(),
      el = $("transactionsTable");
    if (!items.length) {
      el.innerHTML =
        '<div class="empty-state"><i class="bi bi-search"></i><p>No transactions match these filters.</p></div>';
      return;
    }
    el.innerHTML = `<div class="table-responsive"><table class="table"><thead><tr><th>Transaction</th><th>Category</th><th>Type</th><th>Date</th><th class="text-end">Amount</th><th></th></tr></thead><tbody>${items.map((t) => `<tr><td><div class="table-title">${Ledger.escape(t.title)}</div>${t.description ? `<div class="table-note">${Ledger.escape(t.description)}</div>` : ""}</td><td>${Ledger.escape(t.category)}</td><td><span class="type-badge ${t.type}">${t.type}</span></td><td>${Ledger.dateText(t.date)}</td><td class="text-end fw-bold ${t.type === "income" ? "text-success" : ""}">${t.type === "income" ? "+" : "-"}${Ledger.money(t.amount)}</td><td><div class="actions"><button class="action-btn edit" data-id="${t.id}" title="Edit"><i class="bi bi-pencil"></i></button><button class="action-btn delete" data-id="${t.id}" title="Delete"><i class="bi bi-trash3"></i></button></div></td></tr>`).join("")}</tbody></table></div>`;
    el.querySelectorAll(".edit").forEach((b) =>
      b.addEventListener("click", () => Ledger.edit(b.dataset.id)),
    );
    el.querySelectorAll(".delete").forEach((b) =>
      b.addEventListener("click", () => Ledger.remove(b.dataset.id)),
    );
  }
  ["searchInput", "categoryFilter", "typeFilter", "sortSelect"].forEach((id) =>
    $(id).addEventListener(id === "searchInput" ? "input" : "change", render),
  );
  $("clearData").addEventListener("click", Ledger.clearAll);
  document.addEventListener("ledger:changed", render);
  render();
});
