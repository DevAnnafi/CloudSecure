const API_BASE = "http://localhost:8000";

export async function getDashboard() {
  const token = localStorage.getItem("token")
  const res = await fetch(`${API_BASE}/dashboard`, {
    headers: { "Authorization": `Bearer ${token}` }
  })
  if (!res.ok) throw new Error("Failed to fetch dashboard")
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