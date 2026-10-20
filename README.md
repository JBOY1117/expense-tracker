# Ledgerly Expense Tracker

Ledgerly is a responsive personal finance dashboard built entirely in the browser. It helps users record income and expenses, review transaction history, and understand spending patterns without a server or account.

## Features

- Dashboard with available balance, income, expenses, transaction count, recent activity, and cash-flow summaries
- Add and edit transactions with required-field validation and optional notes
- Search, category/type filters, and date or amount sorting
- Delete individual entries or clear all saved data after confirmation
- Canvas-based charts for monthly income vs. expenses and category spending
- Responsive sidebar and transaction table for desktop, tablet, and mobile
- Persistent light/dark appearance preference

## Technologies

- HTML5
- CSS3 and Bootstrap 5
- Vanilla JavaScript
- Browser LocalStorage
- Bootstrap Icons

## Folder Structure

```text
expense-tracker/
├── index.html              # Dashboard overview
├── transactions.html       # Transaction management workspace
├── css/
│   └── style.css           # Responsive visual system and dark mode
├── js/
│   ├── app.js              # Data, forms, totals, dashboard, storage
│   ├── transactions.js     # Table, search, filters, sorting, actions
│   └── charts.js           # Responsive canvas chart rendering
├── assets/
│   └── images/             # Reserved for future visual assets
└── README.md
```

## LocalStorage

Transactions are stored as JSON under the `ledgerly-transactions` key in the browser's LocalStorage. `app.js` loads the saved array when either page opens and writes it after every add, edit, delete, or clear action. The selected color mode is stored separately as `ledgerly-theme`.

Data remains available after refreshes and browser restarts in the same browser profile. Clearing browser site data or using the **Clear data** action removes it.

## Run Locally

No build step, package manager, or backend is required. Open `index.html` in a modern browser. An internet connection is needed for the Bootstrap and Bootstrap Icons CDN links.

## JavaScript Organization

`app.js` owns the transaction state and exposes focused functions for loading/saving LocalStorage, calculating totals, adding/editing/deleting entries, rendering dashboard stats, and UI feedback. `transactions.js` owns the management table and its search/filter/sort view state. `charts.js` draws the dashboard's responsive canvas visualizations from the shared transaction data.

## Future Improvements

- CSV import/export and printable reports
- Custom categories and budget limits
- Date-range filtering and recurring transactions
- Multi-currency support
- Optional cloud sync with user authentication
