const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export async function createProfile(profileData) {
  const res = await fetch(`${API_BASE}/profile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profileData),
  });
  if (!res.ok) throw new Error("Failed to create profile");
  return res.json();
}

export async function matchSchemes(profileId, includeLive = true) {
  const res = await fetch(`${API_BASE}/schemes/match?profile_id=${profileId}&include_live=${includeLive}`);
  if (!res.ok) throw new Error("Failed to fetch matches");
  return res.json();
}

export async function getSchemeSummary(schemeId, lang = "en") {
  const res = await fetch(`${API_BASE}/schemes/${schemeId}/summary?lang=${lang}`);
  if (!res.ok) throw new Error("Failed to fetch summary");
  return res.json();
}

export async function getTTSAudio(text, lang = "en") {
  const res = await fetch(`${API_BASE}/tts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, lang }),
  });
  if (!res.ok) throw new Error("TTS failed");
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

export async function sendChatMessage(message, lang = "en", currentSchemeId = null, profile = null) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      lang,
      current_scheme_id: currentSchemeId,
      profile,
    }),
  });
  if (!res.ok) throw new Error("Chat request failed");
  return res.json();
}

export async function searchLiveSchemes(query, category = "", state = "") {
  const params = new URLSearchParams({ q: query });
  if (category) params.append("category", category);
  if (state) params.append("state", state);
  const res = await fetch(`${API_BASE}/schemes/live-search?${params.toString()}`);
  if (!res.ok) throw new Error("Live search failed");
  return res.json();
}

export async function triggerLiveSync() {
  const res = await fetch(`${API_BASE}/schemes/sync-live`, { method: "POST" });
  if (!res.ok) throw new Error("Live sync failed");
  return res.json();
}
