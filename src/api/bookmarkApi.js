import { apiRequest } from "./apiClient";

export function getBookmarks() {
  return apiRequest("/api/bookmarks", {
    method: "GET",
  });
}

export function getBookmarksByType(type) {
  return apiRequest(`/api/bookmarks/type/${type}`, {
    method: "GET",
  });
}

export function createBookmark(payload) {
  return apiRequest("/api/bookmarks", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deleteBookmark(bookmarkId) {
  return apiRequest(`/api/bookmarks/${bookmarkId}`, {
    method: "DELETE",
  });
}