import { apiRequest } from "./apiClient";

export function getBudgets() {
  return apiRequest("/api/budgets", {
    method: "GET",
  });
}

export function getBudgetsForMonth(year, month) {
  return apiRequest(
    `/api/budgets/month?year=${year}&month=${month}`,
    {
      method: "GET",
    }
  );
}

export function createBudget(payload) {
  return apiRequest("/api/budgets", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateBudget(budgetId, payload) {
  return apiRequest(`/api/budgets/${budgetId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteBudget(budgetId) {
  return apiRequest(`/api/budgets/${budgetId}`, {
    method: "DELETE",
  });
}