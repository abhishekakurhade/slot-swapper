// ✅ src/api.js

const LOCAL_BACKEND = "http://127.0.0.1:8000/api";

const API_BASE =
  process.env.REACT_APP_API_URL ||
  (window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? LOCAL_BACKEND
    : `${window.location.origin.replace(":3000", ":8000")}/api`);

// ---------------------------------------------------------------------
// Generic Fetch Wrapper
// ---------------------------------------------------------------------
export async function fetchJson(path, options = {}) {
  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    console.error(`API error ${response.status}: ${text}`);
    throw new Error(`API error ${response.status}: ${text}`);
  }

  return await response.json();
}

// ---------------------------------------------------------------------
// AUTH
// ---------------------------------------------------------------------
export async function signup(data) {
  return await fetchJson("/signup", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function login(email, password) {
  return await fetchJson("/token/json", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function getMe(token) {
  return await fetchJson("/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ---------------------------------------------------------------------
// EVENTS (CALENDAR SECTION)
// ---------------------------------------------------------------------
export async function listMyEvents(token) {
  return await fetchJson("/events", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function createEvent(data, token) {
  return await fetchJson("/events", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

export async function toggleSwappable(eventId, status, token) {
  return await fetchJson(`/events/${eventId}/status`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status }),
  });
}

// 🟢 NEW: Update Event (Edit button in Calendar)
export async function updateEvent(eventId, data, token) {
  return await fetchJson(`/events/${eventId}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

// 🗑️ NEW: Delete Event (Delete button in Calendar)
export async function deleteEvent(eventId, token) {
  return await fetchJson(`/events/${eventId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ---------------------------------------------------------------------
// MARKETPLACE SECTION
// ---------------------------------------------------------------------
export async function getMarketplaceItems(token) {
  return await fetchJson("/marketplace", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function createMarketplaceItem(data, token) {
  return await fetchJson("/marketplace", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

// 🟢 NEW: Update Marketplace item (Edit button)
export async function updateMarketplaceItem(itemId, data, token) {
  return await fetchJson(`/marketplace/${itemId}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

// 🗑️ NEW: Delete Marketplace item (Delete button)
export async function deleteMarketplaceItem(itemId, token) {
  return await fetchJson(`/marketplace/${itemId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ---------------------------------------------------------------------
// SWAP REQUESTS
// ---------------------------------------------------------------------
export async function getSwappableSlots(token) {
  return await fetchJson("/swappable-slots", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function createSwapRequest(data, token) {
  return await fetchJson("/requests", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

export async function listRequests(token) {
  return await fetchJson("/requests", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function respondToRequest(requestId, accept, token) {
  return await fetchJson(`/requests/${requestId}/respond`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ accept }),
  });
}
