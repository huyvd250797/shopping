export function AdminPlaceholder({ title, version, children }: { title: string; version: string; children: React.ReactNode }) {
  return (
    <>
      <div className="admin-page-head">
        <div><h1>{title}</h1><p>Route và shell đã dựng ở Foundation.</p></div>
        <span className="route-chip">{version}</span>
      </div>
      <section className="panel"><p>{children}</p></section>
    </>
  );
}
