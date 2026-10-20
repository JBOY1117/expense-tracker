window.LedgerCharts = (() => {
  // Shared chart colors and formatting helpers.
  const colors = [
    "#365bf6",
    "#19aa78",
    "#f19a4b",
    "#9767dc",
    "#e96970",
    "#35a7c8",
  ];
  const money = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  function canvas(id) {
    const el = document.getElementById(id);
    if (!el) return null;
    const rect = el.getBoundingClientRect(),
      ratio = window.devicePixelRatio || 1;
    el.width = rect.width * ratio;
    el.height = rect.height * ratio;
    const ctx = el.getContext("2d");
    ctx.scale(ratio, ratio);
    return [ctx, rect.width, rect.height];
  }
  // Six-month income and expense line chart.
  function trend(items) {
    const info = canvas("trendChart");
    if (!info) return;
    const [ctx, w, h] = info;
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      return {
        label: d.toLocaleString("en", { month: "short" }),
        key: d.toISOString().slice(0, 7),
        income: 0,
        expense: 0,
      };
    });
    items.forEach((t) => {
      const m = months.find((x) => x.key === t.date.slice(0, 7));
      if (m) m[t.type] += Number(t.amount);
    });
    const max = Math.max(100, ...months.flatMap((m) => [m.income, m.expense]));
    const pad = { l: 34, r: 8, t: 12, b: 27 };
    ctx.font = "11px system-ui";
    ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue(
      "--line",
    );
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue("--muted");
    for (let i = 0; i < 4; i++) {
      const y = pad.t + ((h - pad.t - pad.b) * i) / 3;
      ctx.beginPath();
      ctx.moveTo(pad.l, y);
      ctx.lineTo(w - pad.r, y);
      ctx.stroke();
      ctx.fillText("$" + Math.round((max * (3 - i)) / 3), 0, y + 4);
    }
    const step = (w - pad.l - pad.r) / 6;
    function line(key, color) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      months.forEach((m, i) => {
        const x = pad.l + step * (i + 0.5),
          y = pad.t + (h - pad.t - pad.b) * (1 - m[key] / max);
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      });
      ctx.stroke();
      ctx.fillStyle = color;
      months.forEach((m, i) => {
        const x = pad.l + step * (i + 0.5),
          y = pad.t + (h - pad.t - pad.b) * (1 - m[key] / max);
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
    }
    line("income", "#365bf6");
    line("expense", "#e97570");
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue("--muted");
    months.forEach((m, i) =>
      ctx.fillText(m.label, pad.l + step * (i + 0.5) - 10, h - 5),
    );
  }
  // Expense category doughnut chart and legend.
  function category(items) {
    const info = canvas("categoryChart");
    const legend = document.getElementById("categoryLegend");
    const totalEl = document.getElementById("donutTotal");
    if (!info) return;
    const [ctx, w, h] = info;
    const entries = Object.entries(
      items
        .filter((t) => t.type === "expense")
        .reduce((a, t) => {
          a[t.category] = (a[t.category] || 0) + Number(t.amount);
          return a;
        }, {}),
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
    const total = entries.reduce((a, [, v]) => a + v, 0);
    if (totalEl) totalEl.textContent = money(total);
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2,
      cy = h / 2,
      r = Math.min(w, h) / 2 - 10;
    let start = -Math.PI / 2;
    if (!total) {
      ctx.strokeStyle = "#dfe5ee";
      ctx.lineWidth = 18;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      if (legend)
        legend.innerHTML =
          '<span class="muted">Add expenses to see a breakdown.</span>';
      return;
    }
    entries.forEach(([name, value], i) => {
      const angle = (value / total) * Math.PI * 2;
      ctx.strokeStyle = colors[i];
      ctx.lineWidth = 18;
      ctx.lineCap = "butt";
      ctx.beginPath();
      ctx.arc(cx, cy, r, start, start + angle);
      ctx.stroke();
      start += angle;
    });
    if (legend)
      legend.innerHTML = entries
        .map(
          ([name, value], i) =>
            `<div class="category-item"><span style="background:${colors[i]}"></span><span class="cat-name">${name}</span><span class="cat-amount">${money(value)}</span></div>`,
        )
        .join("");
  }
  return {
    update(items) {
      trend(items);
      category(items);
    },
  };
})();
