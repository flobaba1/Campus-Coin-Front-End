// import { apiRequest } from "./apiClient";

// export function getNotifications() {
//   return apiRequest("/api/notifications", {
//     method: "GET",
//   });
// }

// export function markNotificationAsRead(
//   notificationId
// ) {
//   return apiRequest(
//     `/api/notifications/${notificationId}/read`,
//     {
//       method: "PUT",
//     }
//   );
// }

 import { apiRequest } from "./apiClient";

export async function getNotifications() {
  const response = await apiRequest("/api/notifications", {
    method: "GET",
  });

  console.log("=================================");
  console.log("CAMPUS COIN NOTIFICATIONS");
  console.log("Raw response:", response);
  console.log("Is array:", Array.isArray(response));
  console.log("Length:", Array.isArray(response) ? response.length : "N/A");
  console.log("=================================");

  return response;
}

export function markNotificationAsRead(notificationId) {
  return apiRequest(
    `/api/notifications/${notificationId}/read`,
    {
      method: "PUT",
    }
  );
}