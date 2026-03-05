const API_BASE = "http://localhost:8000";

export async function getDashboard() {
  const res = await fetch(`${API_BASE}/dashboard`);
  if (!res.ok) throw new Error("Failed to fetch dashboard");
  return res.json();
}

export async function getScans() {
  const res = await fetch(`${API_BASE}/scans`);
  if (!res.ok) throw new Error("Failed to fetch scans");
  return res.json();
}

export async function getScan(id: number) {
  const res = await fetch(`${API_BASE}/scans/${id}`);
  if (!res.ok) throw new Error("Failed to fetch scan");
  return res.json();
}

export async function createScan(accountId: number) {
  const res = await fetch(`${API_BASE}/scans`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ account_id: accountId }),
  });
  if (!res.ok) throw new Error("Failed to create scan");
  return res.json();
}

export async function getFindings(scanId: number) {
  const res = await fetch(`${API_BASE}/findings/${scanId}`);
  if (!res.ok) throw new Error("Failed to fetch findings");
  return res.json();
}