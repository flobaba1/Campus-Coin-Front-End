import { apiRequest } from "./apiClient";

export function getCategorySuggestion(description, type) {
  const params = new URLSearchParams({
    description,
    type,
  });

  return apiRequest(
    `/api/ai/category-suggestion?${params.toString()}`,
    {
      method: "GET",
    }
  );
}

export function generateMonthlyReport(month) {
  return apiRequest(`/api/ai/generate-report?months=${encodeURIComponent(month)}`, {
    method: "GET",
  });
}
