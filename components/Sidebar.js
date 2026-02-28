import Link from "next/link";
import { useRouter } from "next/router";

export default function Sidebar() {
  const router = useRouter();

  const menuItem = (path, label) => (
    <Link href={path}>
      <div
        style={{
          padding: "14px 20px",
          marginBottom: "10px",
          borderRadius: "8px",
          cursor: "pointer",
          background:
            router.pathname === path ? "#2563eb" : "transparent",
          color:
            router.pathname === path ? "white" : "#cbd5e1",
          fontWeight: 500,
        }}
      >
        {label}
      </div>
    </Link>
  );

  return (
    <div
      style={{
        width: "260px",
        background: "#0f172a",
        padding: "30px 20px",
      }}
    >
      <h2 style={{ color: "white", marginBottom: "30px" }}>
        Maintenance System
      </h2>

      {menuItem("/", "Dashboard")}
      {menuItem("/data-entry", "Data Entry")}
      {menuItem("/reports", "Reports")}
      {menuItem("/admin", "Admin")}
      {menuItem("/settings", "Settings")}
    </div>
  );
}
