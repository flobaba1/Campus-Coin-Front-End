let categoriesCache = null;
let budgetsCache = new Map();
let reportTransactionsCache = null;
let allBudgetsCache = null;

export function getCachedAllBudgets() {
  return allBudgetsCache;
}

export function setCachedAllBudgets(data) {
  allBudgetsCache = Array.isArray(data) ? data : [];
}

export function getCachedCategories() {
  return categoriesCache;
}

export function setCachedCategories(data) {
  categoriesCache = Array.isArray(data) ? data : [];
}

export function getCachedBudgets(year, month) {
  return budgetsCache.get(`${year}-${month}`) ?? null;
}

export function setCachedBudgets(year, month, data) {
  budgetsCache.set(
    `${year}-${month}`,
    Array.isArray(data) ? data : [],
  );
}

export function getCachedReportTransactions() {
  return reportTransactionsCache;
}

export function setCachedReportTransactions(data) {
  reportTransactionsCache = Array.isArray(data) ? data : [];
}


let moneyToolsNotificationsCache = null;
let bookmarksCache = null;

// AI Insights and Saving Tips share notifications.
export function getCachedMoneyToolsNotifications() {
  return moneyToolsNotificationsCache;
}

export function setCachedMoneyToolsNotifications(data) {
  moneyToolsNotificationsCache = Array.isArray(data) ? data : [];
}

// AI Insights, Saving Tips, and Bookmarks share saved bookmarks.
export function getCachedBookmarks() {
  return bookmarksCache;
}

export function setCachedBookmarks(data) {
  bookmarksCache = Array.isArray(data) ? data : [];
}