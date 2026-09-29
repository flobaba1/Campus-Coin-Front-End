import { apiRequest } from "./apiClient";

export function getNotifications() {
  return apiRequest("/api/notifications", {
    method: "GET",
  });
}

export function markNotificationAsRead(
  notificationId
) {
  return apiRequest(
    `/api/notifications/${notificationId}/read`,
    {
      method: "PUT",
    }
  );
}