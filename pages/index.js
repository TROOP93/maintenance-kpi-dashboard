import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import DashboardView from "../components/DashboardView";
import { loadData } from "../lib/storage";

const DEFAULT_DATA = { /* نفس حقك */ };

export default function Home() {
  const [data, setData] = useState(DEFAULT_DATA);

  useEffect(() => {
    const saved = loadData();
    if (saved && saved.regions) setData(saved);
  }, []);

  return (
    <Layout>
      <DashboardView data={data} />
    </Layout>
  );
}

export async function getServerSideProps() {
  return { props: {} };
}
