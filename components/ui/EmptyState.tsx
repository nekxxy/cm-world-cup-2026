export default function EmptyState({
  icon = "🏟️",
  title,
  message,
  action,
}: {
  icon?: string;
  title: string;
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: 8,
        padding: "48px 24px",
        minHeight: "50svh",
      }}
    >
      <div style={{ fontSize: 40, opacity: 0.8 }} aria-hidden>{icon}</div>
      <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{title}</h2>
      <p style={{ margin: 0, color: "var(--color-muted)", fontSize: 14, lineHeight: 1.5, maxWidth: 320 }}>{message}</p>
      {action && <div style={{ marginTop: 12 }}>{action}</div>}
    </div>
  );
}
