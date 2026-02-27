export default function Home() {
  return (
    <div style={{
      fontFamily: "Arial",
      padding: "40px",
      background: "#f4f6f9",
      minHeight: "100vh"
    }}>
      
      <h1 style={{color:"#0b1f3a"}}>
        Maintenance Performance Dashboard
      </h1>

      <p style={{color:"#555"}}>
        Executive PM & CM Performance Tracking
      </p>

      <div style={{
        marginTop:"40px",
        background:"#ffffff",
        padding:"30px",
        borderRadius:"12px",
        boxShadow:"0 10px 25px rgba(0,0,0,0.08)"
      }}>
        <h2>System Ready ✅</h2>
        <p>
          Your KPI dashboard is successfully deployed on Vercel.
        </p>
      </div>

    </div>
  )
}
