// Format a UTC ISO timestamp in India Standard Time for our mostly-Indian
// audience. e.g. "14 Jun, 8:30 PM IST".
export function formatIST(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" });
  const time = d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" });
  return `${date}, ${time} IST`;
}
