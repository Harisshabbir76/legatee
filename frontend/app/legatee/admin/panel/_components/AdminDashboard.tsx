import { fetchInsights } from "@/lib/api";
import AdminShell from "./AdminShell";
import styles from "@/app/styles/dashboard styling/insights.module.css";

function formatCurrency(amount: number): string {
  return `${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })} AED`;
}

export default async function AdminDashboard() {
  const insights = await fetchInsights();

  const stats = [
    { label: "Total products", value: insights.totalProducts.toLocaleString("en-US") },
    { label: "Total orders",   value: insights.totalOrders.toLocaleString("en-US") },
    { label: "Monthly income", value: formatCurrency(insights.monthlyIncome) },
  ];

  return (
    <AdminShell title="Dashboard">
      <p className={styles.dashboardHint}>Manage your product catalog and orders.</p>

      <div className={styles.statsGrid}>
        {stats.map((stat) => (
          <div key={stat.label} className={styles.statCard}>
            <p className={styles.statLabel}>{stat.label}</p>
            <p className={styles.statValue}>{stat.value}</p>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
