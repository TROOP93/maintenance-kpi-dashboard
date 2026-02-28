import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f4f6f9" }}>
      
      {/* Main Content */}
      <div style={{ flex: 1, padding: "30px" }}>
        {children}
      </div>

      {/* Sidebar on RIGHT */}
      <Sidebar />

    </div>
  );
}
