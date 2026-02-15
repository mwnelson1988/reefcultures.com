// app/coming-soon/page.tsx

type SearchParams = {
  from?: string;
  openAt?: string;
};

type Props = {
  // Next.js 15+ generated types often treat searchParams as Promise-based
  searchParams?: Promise<SearchParams>;
};

export default async function ComingSoonPage({ searchParams }: Props) {
  const sp = (await searchParams) ?? {};
  const from = sp.from ?? "";
  const openAt = sp.openAt ?? "";

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "720px",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "16px",
          padding: "28px",
          background: "rgba(0,0,0,0.25)",
          backdropFilter: "blur(8px)",
        }}
      >
        <h1 style={{ fontSize: "32px", margin: "0 0 10px 0" }}>
          Reefcultures is coming soon
        </h1>

        <p style={{ margin: "0 0 18px 0", opacity: 0.9, lineHeight: 1.6 }}>
          We’re building the full site right now. Early Access signups get 20% off
          before launch.
        </p>

        {(from || openAt) && (
          <div
            style={{
              marginTop: "14px",
              padding: "12px 14px",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.06)",
              fontSize: "14px",
              lineHeight: 1.5,
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: "6px" }}>
              Debug / tracking params detected:
            </div>
            {from && (
              <div>
                <strong>from:</strong> {from}
              </div>
            )}
            {openAt && (
              <div>
                <strong>openAt:</strong> {openAt}
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: "22px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <a
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px 14px",
              borderRadius: "12px",
              textDecoration: "none",
              border: "1px solid rgba(255,255,255,0.18)",
              color: "inherit",
            }}
          >
            Home
          </a>

          <a
            href="/early-access"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px 14px",
              borderRadius: "12px",
              textDecoration: "none",
              border: "1px solid rgba(255,255,255,0.18)",
              color: "inherit",
            }}
          >
            Early Access
          </a>
        </div>
      </section>
    </main>
  );
}
