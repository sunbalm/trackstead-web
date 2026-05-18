export default function PageLoader({ message = "Loading..." }) {
  return (
    <main className="authShell">
      <section className="card emptyState">
        <div className="loadingPulse" />
        <h2>{message}</h2>
      </section>
    </main>
  );
}