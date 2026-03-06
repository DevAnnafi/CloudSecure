const API_BASE = "http://localhost:8000";

export async function getDashboard() {
  const token = localStorage.getItem("token")
  const res = await fetch(`${API_BASE}/dashboard`, {
    headers: { "Authorization": `Bearer ${token}` }
  })
  if (!res.ok) return null
  return res.json()
}

export async function getScans() {
  const token = localStorage.getItem("token")
  const res = await fetch(`${API_BASE}/scans`, {
    headers: { "Authorization": `Bearer ${token}` }
  })
  if (!res.ok) throw new Error("Failed to fetch scans");
  return res.json();
}

export async function getScan(id: number) {
  const token = localStorage.getItem("token")
  const res = await fetch(`${API_BASE}/scans/${id}`, {
    headers: { "Authorization": `Bearer ${token}`}
  });
  if (!res.ok) throw new Error("Failed to fetch scan");
  return res.json();
}

export async function createScan(accountId: number) {
  const token = localStorage.getItem("token")
  const res = await fetch(`${API_BASE}/scans`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ account_id: accountId }),
  });
  if (!res.ok) throw new Error("Failed to create scan");
  return res.json();
}

export async function getFindings(scanId: number) {
  const token = localStorage.getItem("token")
  const res = await fetch(`${API_BASE}/findings/${scanId}`, {
    headers: { "Authorization": `Bearer ${token}`}
  });
  if (!res.ok) throw new Error("Failed to fetch findings");
  return res.json();
}

export async function getMe() {
  const token = localStorage.getItem("token")
  if (!token) return null
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { "Authorization": `Bearer ${token}` }
  })
  if (!res.ok) return null
  return res.json()
}

export async function updateAvatar(base64: string) {
  const token = localStorage.getItem("token")
  const res = await fetch(`${API_BASE}/auth/me/avatar`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ avatar: base64 })
  })
  if (!res.ok) return null
  return res.json()
}

export async function updateProfile(data: { full_name?: string; email?: string }) {
  const token = localStorage.getItem("token")
  const res = await fetch(`${API_BASE}/auth/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data)
  })
  if (!res.ok) return null
  return res.json()
}

export async function updatePassword(current_password: string, new_password: string) {
  const token = localStorage.getItem("token")
  const res = await fetch(`${API_BASE}/auth/me/password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ current_password, new_password })
  })
  if (!res.ok) throw new Error("Incorrect current password")
  return res.json()
}