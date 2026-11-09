import type { Metadata } from "next";

import { AdminLoginForm } from "@/components/admin/login-form";
import { AdminLogoutButton } from "@/components/admin/logout-button";
import { ChartIcon, DownloadIcon } from "@/components/icons";
import { isAdminConfigured, isAuthenticatedAdmin } from "@/lib/admin-auth";
import { formatNumber, formatPosition } from "@/lib/format";
import { effectivePosition } from "@/lib/referrals";
import { getWaitlistStore, WaitlistStoreNotConfiguredError } from "@/lib/store";
import type { WaitlistEntry, WaitlistStats } from "@/lib/store/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Waitlist admin",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

type AdminData = {
  stats: WaitlistStats;
  entries: WaitlistEntry[];
};

function formatDay(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00.000Z`));
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

async function getAdminData(): Promise<AdminData> {
  const store = getWaitlistStore();
  const [stats, entries] = await Promise.all([store.getStats(14), store.listForExport()]);

  return { stats, entries };
}

export default async function AdminPage() {
  if (!isAdminConfigured()) {
    return (
      <div className="shell admin-page">
        <p className="eyebrow">Private</p>
        <h1 className="display" style={{ marginTop: "1rem" }}>
          Waitlist admin
        </h1>
        <div className="admin-config" role="status">
          <p>
            Admin access is not configured. Set <code>ADMIN_SECRET</code> to a random value of
            at least 16 characters, then restart the deployment.
          </p>
        </div>
      </div>
    );
  }

  if (!(await isAuthenticatedAdmin())) {
    return (
      <div className="shell admin-page">
        <AdminLoginForm />
      </div>
    );
  }

  let data: AdminData;

  try {
    data = await getAdminData();
  } catch (error) {
    const isConfig = error instanceof WaitlistStoreNotConfiguredError;

    return (
      <div className="shell admin-page">
        <p className="eyebrow">Private</p>
        <h1 className="display" style={{ marginTop: "1rem" }}>
          Waitlist admin
        </h1>
        <div className="admin-config" role="alert">
          <p>
            {isConfig
              ? "Waitlist storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, or use a preview file store explicitly."
              : "The waitlist data could not be loaded just now. Check the server logs and try again."}
          </p>
        </div>
      </div>
    );
  }

  const { stats, entries } = data;
  const maxDaily = Math.max(1, ...stats.daily.map((day) => day.count));
  const recent = [...entries].sort((left, right) => right.position - left.position).slice(0, 12);
  const windowTotal = stats.daily.reduce((sum, day) => sum + day.count, 0);

  return (
    <div className="shell admin-page">
      <header className="admin-head">
        <div>
          <p className="eyebrow">Private</p>
          <h1>Waitlist admin</h1>
        </div>
        <div className="admin-actions">
          <a className="button button-ghost button-small" href="/api/admin/export" download>
            <DownloadIcon />
            Export CSV
          </a>
          <AdminLogoutButton />
        </div>
      </header>

      <div className="stats-grid" aria-label="Waitlist summary">
        <div className="stat">
          <p className="stat-label">On the list</p>
          <p className="stat-value">{formatNumber(stats.active)}</p>
        </div>
        <div className="stat">
          <p className="stat-label">All time</p>
          <p className="stat-value">{formatNumber(stats.total)}</p>
        </div>
        <div className="stat">
          <p className="stat-label">Priority</p>
          <p className="stat-value">{formatNumber(stats.priority)}</p>
        </div>
        <div className="stat">
          <p className="stat-label">Last 7 days</p>
          <p className="stat-value">{formatNumber(stats.last7Days)}</p>
        </div>
      </div>

      <section className="admin-panel" aria-labelledby="chart-title">
        <div className="admin-panel-head">
          <h2 id="chart-title">Signups, last 14 days</h2>
          <p className="admin-panel-note">
            {formatNumber(windowTotal)} in this window · UTC days
          </p>
        </div>

        <div className="chart" aria-hidden="true">
          {stats.daily.map((day) => (
            <div className="chart-column" key={day.date} title={`${formatDay(day.date)}: ${day.count}`}>
              <div
                className="chart-bar"
                style={{ height: `${Math.max(2, Math.round((day.count / maxDaily) * 100))}%` }}
              />
            </div>
          ))}
        </div>
        <div className="chart-labels" aria-hidden="true">
          {stats.daily.map((day, index) => (
            <span key={day.date}>{index % 3 === 0 || index === stats.daily.length - 1 ? formatDay(day.date) : ""}</span>
          ))}
        </div>

        <table className="sr-only">
          <caption>Daily waitlist signups for the last 14 UTC days</caption>
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Signups</th>
            </tr>
          </thead>
          <tbody>
            {stats.daily.map((day) => (
              <tr key={day.date}>
                <th scope="row">{day.date}</th>
                <td>{day.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="admin-panel" aria-labelledby="recent-title">
        <div className="admin-panel-head">
          <h2 id="recent-title">Recent signups</h2>
          <p className="admin-panel-note">
            <ChartIcon width={12} height={12} style={{ display: "inline", verticalAlign: "-1px" }} />{" "}
            {formatNumber(entries.length)} total rows
          </p>
        </div>

        {recent.length === 0 ? (
          <p className="admin-empty">No signups yet. The page is live; the first one will appear here.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <caption className="sr-only">Most recent waitlist signups</caption>
              <thead>
                <tr>
                  <th scope="col">Joined</th>
                  <th scope="col">Email</th>
                  <th scope="col">Place</th>
                  <th scope="col">Effective</th>
                  <th scope="col">Referrals</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((entry) => (
                  <tr key={entry.id}>
                    <td>{formatDate(entry.createdAt)}</td>
                    <td className="email-cell">{entry.email}</td>
                    <td>{formatPosition(entry.position)}</td>
                    <td>{formatPosition(effectivePosition(entry.position, entry.referralCount))}</td>
                    <td>{entry.referralCount}</td>
                    <td>{entry.unsubscribedAt ? "Left" : "Active"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="admin-panel-note" style={{ marginTop: "1.25rem" }}>
        Exports contain personal data. Store them only where you have permission to keep them.
      </p>
    </div>
  );
}
