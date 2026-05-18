import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <span>© {new Date().getFullYear()} Clearwell</span>

      <div className="footerLinks">
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
      </div>
    </footer>
  );
}