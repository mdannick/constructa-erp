import { useState } from "react";

const data = {
  finance: {
    revenue: 284500,
    expenses: 163200,
    outstanding: 47800,
    profit: 121300,
    recentInvoices: [
      { id: "INV-041", client: "Harmon Developments", amount: 32000, status: "Paid", date: "Feb 22" },
      { id: "INV-042", client: "Kestrel Properties", amount: 18500, status: "Pending", date: "Feb 27" },
      { id: "INV-043", client: "Clearview Builders", amount: 12400, status: "Overdue", date: "Feb 10" },
      { id: "INV-044", client: "Dunmore Construction", amount: 21900, status: "Paid", date: "Mar 01" },
    ],
  },
  hr: {
    totalStaff: 9,
    onSite: 6,
    onLeave: 1,
    payrollDue: "Mar 07",
    employees: [
      { name: "Marcus Webb", role: "Site Foreman", status: "On Site", hours: 162 },
      { name: "Denise Okoro", role: "Project Manager", status: "Office", hours: 148 },
      { name: "Luka Petrov", role: "Electrician", status: "On Site", hours: 155 },
      { name: "Sam Huang", role: "Carpenter", status: "Leave", hours: 80 },
      { name: "Rashida Cole", role: "Accountant", status: "Office", hours: 140 },
    ],
  },
  crm: {
    activeClients: 12,
    leads: 5,
    closedDeals: 3,
    pipelineValue: 890000,
    clients: [
      { name: "Harmon Developments", stage: "Active", value: 280000, next: "Site visit Mar 5" },
      { name: "Kestrel Properties", stage: "Proposal", value: 145000, next: "Quote due Mar 8" },
      { name: "Clearview Builders", stage: "Negotiation", value: 320000, next: "Meeting Mar 4" },
      { name: "Dunmore Construction", stage: "Active", value: 95000, next: "Invoice Mar 10" },
      { name: "Ravenswood Group", stage: "Lead", value: 220000, next: "Call Mar 6" },
    ],
  },
};

const fmt = (n) => new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(n);

const statusColor = (s) => ({
  Paid: "#4ade80", Pending: "#facc15", Overdue: "#f87171",
  "On Site": "#38bdf8", Office: "#a78bfa", Leave: "#fb923c",
  Active: "#4ade80", Proposal: "#facc15", Negotiation: "#38bdf8", Lead: "#fb923c",
}[s] || "#94a3b8");

const tabs = ["Overview", "Finance", "HR & Payroll", "CRM & Clients"];

export default function App() {
  const [active, setActive] = useState("Overview");

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0d0f12",
      color: "#e2e8f0",
      fontFamily: "'DM Mono', 'Courier New', monospace",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Barlow+Condensed:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #1a1d23; } ::-webkit-scrollbar-thumb { background: #374151; border-radius: 2px; }
        .tab { cursor: pointer; padding: 8px 20px; font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; border: none; background: transparent; color: #64748b; transition: all 0.2s; border-bottom: 2px solid transparent; }
        .tab:hover { color: #cbd5e1; }
        .tab.active { color: #f97316; border-bottom-color: #f97316; }
        .card { background: #13161c; border: 1px solid #1e2530; border-radius: 2px; padding: 24px; }
        .card-sm { background: #13161c; border: 1px solid #1e2530; border-radius: 2px; padding: 18px 20px; }
        .stat-label { font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: #4b5563; margin-bottom: 6px; }
        .stat-val { font-family: 'Barlow Condensed', sans-serif; font-size: 32px; font-weight: 800; color: #f1f5f9; line-height: 1; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 1px; font-size: 10px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; }
        .row-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #1a1e26; }
        .row-item:last-child { border-bottom: none; }
        .accent { color: #f97316; }
        .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
        .grid4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 16px; }
        @media (max-width: 768px) { .grid4 { grid-template-columns: 1fr 1fr; } .grid3 { grid-template-columns: 1fr 1fr; } .grid2 { grid-template-columns: 1fr; } }
        .section-title { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: #475569; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
        .section-title::after { content: ''; flex: 1; height: 1px; background: #1e2530; }
        .progress-bar { height: 4px; background: #1e2530; border-radius: 0; overflow: hidden; margin-top: 8px; }
        .progress-fill { height: 100%; background: #f97316; }
        .pill { display: inline-flex; align-items: center; gap: 6px; }
        .pill-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
        .btn { font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; padding: 8px 16px; border: 1px solid #f97316; color: #f97316; background: transparent; cursor: pointer; border-radius: 1px; transition: all 0.15s; }
        .btn:hover { background: #f97316; color: #0d0f12; }
        .tag { font-size: 10px; padding: 2px 6px; background: #1a1e26; border: 1px solid #252b35; color: #64748b; }
        .anim-in { animation: fadeUp 0.4s ease both; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: "1px solid #1a1e26", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 0" }}>
          <div style={{ width: 36, height: 36, background: "#f97316", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0d0f12" strokeWidth="2.5"><polygon points="3 9 12 2 21 9 21 20 3 20"/><rect x="9" y="14" width="6" height="6"/></svg>
          </div>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, fontWeight: 800, letterSpacing: "0.06em", lineHeight: 1, color: "#f1f5f9" }}>CONSTRUCTA ERP</div>
            <div style={{ fontSize: 10, color: "#4b5563", letterSpacing: "0.12em", marginTop: 2 }}>MANAGEMENT SYSTEM</div>
          </div>
        </div>
        <nav style={{ display: "flex", gap: 4 }}>
          {tabs.map(t => <button key={t} className={`tab${active === t ? " active" : ""}`} onClick={() => setActive(t)}>{t}</button>)}
        </nav>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 0" }}>
          <div style={{ fontSize: 11, color: "#4b5563", letterSpacing: "0.08em" }}>SUN, MAR 01, 2026</div>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#1e2530", border: "1px solid #374151", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, color: "#f97316" }}>A</div>
        </div>
      </div>

      <div style={{ padding: "32px", maxWidth: 1400, margin: "0 auto" }}>

        {/* OVERVIEW */}
        {active === "Overview" && (
          <div className="anim-in" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 800, color: "#f1f5f9", letterSpacing: "0.04em" }}>
              GOOD MORNING <span className="accent">—</span> HERE'S YOUR SNAPSHOT
            </div>

            {/* Top KPIs */}
            <div className="grid4">
              {[
                { label: "Monthly Revenue", val: fmt(data.finance.revenue), sub: "+12% vs last month", color: "#4ade80" },
                { label: "Outstanding", val: fmt(data.finance.outstanding), sub: "3 invoices unpaid", color: "#facc15" },
                { label: "Active Clients", val: data.crm.activeClients, sub: `${data.crm.leads} new leads`, color: "#38bdf8" },
                { label: "Staff on Site", val: `${data.hr.onSite}/${data.hr.totalStaff}`, sub: `Payroll due ${data.hr.payrollDue}`, color: "#f97316" },
              ].map((k, i) => (
                <div className="card-sm" key={i} style={{ animationDelay: `${i * 0.07}s` }}>
                  <div className="stat-label">{k.label}</div>
                  <div className="stat-val" style={{ color: k.color }}>{k.val}</div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 6 }}>{k.sub}</div>
                </div>
              ))}
            </div>

            <div className="grid2">
              {/* Finance Mini */}
              <div className="card">
                <div className="section-title">Finance Overview</div>
                {[
                  { label: "Revenue", val: data.finance.revenue, color: "#4ade80" },
                  { label: "Expenses", val: data.finance.expenses, color: "#f87171" },
                  { label: "Net Profit", val: data.finance.profit, color: "#f97316" },
                ].map((r, i) => (
                  <div key={i} style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span className="stat-label" style={{ margin: 0 }}>{r.label}</span>
                      <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, fontWeight: 700, color: r.color }}>{fmt(r.val)}</span>
                    </div>
                    <div className="progress-bar"><div className="progress-fill" style={{ width: `${(r.val / data.finance.revenue) * 100}%`, background: r.color }} /></div>
                  </div>
                ))}
                <div style={{ marginTop: 20 }}>
                  <div className="section-title">Recent Invoices</div>
                  {data.finance.recentInvoices.slice(0, 3).map((inv, i) => (
                    <div className="row-item" key={i}>
                      <div>
                        <div style={{ fontSize: 12, color: "#cbd5e1" }}>{inv.client}</div>
                        <div style={{ fontSize: 10, color: "#4b5563", marginTop: 2 }}>{inv.id} · {inv.date}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 700 }}>{fmt(inv.amount)}</div>
                        <span className="badge" style={{ background: `${statusColor(inv.status)}18`, color: statusColor(inv.status) }}>{inv.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CRM + HR Mini */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="card">
                  <div className="section-title">CRM Pipeline</div>
                  <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                    {[
                      { l: "Pipeline", v: fmt(data.crm.pipelineValue) },
                      { l: "Leads", v: data.crm.leads },
                      { l: "Closed", v: data.crm.closedDeals },
                    ].map((s, i) => (
                      <div key={i} style={{ flex: 1, background: "#0d0f12", padding: "10px 14px" }}>
                        <div className="stat-label">{s.l}</div>
                        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, fontWeight: 700, color: "#f1f5f9" }}>{s.v}</div>
                      </div>
                    ))}
                  </div>
                  {data.crm.clients.slice(0, 3).map((c, i) => (
                    <div className="row-item" key={i}>
                      <div className="pill">
                        <div className="pill-dot" style={{ background: statusColor(c.stage) }} />
                        <div>
                          <div style={{ fontSize: 12, color: "#cbd5e1" }}>{c.name}</div>
                          <div style={{ fontSize: 10, color: "#4b5563" }}>{c.next}</div>
                        </div>
                      </div>
                      <span className="tag">{c.stage}</span>
                    </div>
                  ))}
                </div>
                <div className="card">
                  <div className="section-title">HR Snapshot</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
                    {[
                      { l: "Total Staff", v: data.hr.totalStaff, c: "#f1f5f9" },
                      { l: "On Site", v: data.hr.onSite, c: "#38bdf8" },
                      { l: "On Leave", v: data.hr.onLeave, c: "#fb923c" },
                    ].map((s, i) => (
                      <div key={i} style={{ background: "#0d0f12", padding: "10px 14px" }}>
                        <div className="stat-label">{s.l}</div>
                        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 700, color: s.c }}>{s.v}</div>
                      </div>
                    ))}
                  </div>
                  {data.hr.employees.slice(0, 3).map((e, i) => (
                    <div className="row-item" key={i}>
                      <div className="pill">
                        <div className="pill-dot" style={{ background: statusColor(e.status) }} />
                        <div>
                          <div style={{ fontSize: 12, color: "#cbd5e1" }}>{e.name}</div>
                          <div style={{ fontSize: 10, color: "#4b5563" }}>{e.role}</div>
                        </div>
                      </div>
                      <span style={{ fontSize: 11, color: "#64748b" }}>{e.hours}h</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FINANCE */}
        {active === "Finance" && (
          <div className="anim-in" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 800, color: "#f1f5f9" }}>FINANCE <span className="accent">&</span> ACCOUNTING</div>
              <button className="btn">+ New Invoice</button>
            </div>
            <div className="grid4">
              {[
                { label: "Total Revenue", val: fmt(data.finance.revenue), color: "#4ade80" },
                { label: "Total Expenses", val: fmt(data.finance.expenses), color: "#f87171" },
                { label: "Net Profit", val: fmt(data.finance.profit), color: "#f97316" },
                { label: "Outstanding", val: fmt(data.finance.outstanding), color: "#facc15" },
              ].map((k, i) => (
                <div className="card-sm" key={i}>
                  <div className="stat-label">{k.label}</div>
                  <div className="stat-val" style={{ color: k.color }}>{k.val}</div>
                </div>
              ))}
            </div>
            <div className="card">
              <div className="section-title">All Invoices</div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #1e2530" }}>
                      {["Invoice", "Client", "Date", "Amount", "Status", "Actions"].map(h => (
                        <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#4b5563", fontWeight: 500 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.finance.recentInvoices.map((inv, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #1a1e26" }}>
                        <td style={{ padding: "12px 12px", color: "#f97316", fontWeight: 500 }}>{inv.id}</td>
                        <td style={{ padding: "12px 12px", color: "#cbd5e1" }}>{inv.client}</td>
                        <td style={{ padding: "12px 12px", color: "#64748b" }}>{inv.date}</td>
                        <td style={{ padding: "12px 12px", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 700 }}>{fmt(inv.amount)}</td>
                        <td style={{ padding: "12px 12px" }}>
                          <span className="badge" style={{ background: `${statusColor(inv.status)}18`, color: statusColor(inv.status) }}>{inv.status}</span>
                        </td>
                        <td style={{ padding: "12px 12px" }}>
                          <span style={{ fontSize: 10, color: "#4b5563", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase" }}>View</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* HR */}
        {active === "HR & Payroll" && (
          <div className="anim-in" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 800, color: "#f1f5f9" }}>HR <span className="accent">&</span> PAYROLL</div>
              <button className="btn">+ Add Employee</button>
            </div>
            <div className="grid4">
              {[
                { label: "Total Staff", val: data.hr.totalStaff, color: "#f1f5f9" },
                { label: "On Site", val: data.hr.onSite, color: "#38bdf8" },
                { label: "On Leave", val: data.hr.onLeave, color: "#fb923c" },
                { label: "Payroll Due", val: data.hr.payrollDue, color: "#facc15" },
              ].map((k, i) => (
                <div className="card-sm" key={i}>
                  <div className="stat-label">{k.label}</div>
                  <div className="stat-val" style={{ color: k.color, fontSize: 28 }}>{k.val}</div>
                </div>
              ))}
            </div>
            <div className="card">
              <div className="section-title">Employee Directory</div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #1e2530" }}>
                      {["Name", "Role", "Status", "Hours This Month", "Actions"].map(h => (
                        <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#4b5563", fontWeight: 500 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.hr.employees.map((e, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #1a1e26" }}>
                        <td style={{ padding: "14px 12px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#1e2530", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#f97316", fontWeight: 600 }}>{e.name[0]}</div>
                            <span style={{ color: "#cbd5e1" }}>{e.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: "14px 12px", color: "#64748b" }}>{e.role}</td>
                        <td style={{ padding: "14px 12px" }}>
                          <span className="pill">
                            <span className="pill-dot" style={{ background: statusColor(e.status) }} />
                            <span style={{ color: "#94a3b8", fontSize: 11 }}>{e.status}</span>
                          </span>
                        </td>
                        <td style={{ padding: "14px 12px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div className="progress-bar" style={{ width: 80, display: "inline-block" }}>
                              <div className="progress-fill" style={{ width: `${(e.hours / 168) * 100}%` }} />
                            </div>
                            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15, fontWeight: 600, color: "#f1f5f9" }}>{e.hours}h</span>
                          </div>
                        </td>
                        <td style={{ padding: "14px 12px" }}>
                          <span style={{ fontSize: 10, color: "#4b5563", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase" }}>Edit</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* CRM */}
        {active === "CRM & Clients" && (
          <div className="anim-in" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 800, color: "#f1f5f9" }}>CRM <span className="accent">&</span> CLIENTS</div>
              <button className="btn">+ New Client</button>
            </div>
            <div className="grid4">
              {[
                { label: "Active Clients", val: data.crm.activeClients, color: "#4ade80" },
                { label: "Active Leads", val: data.crm.leads, color: "#facc15" },
                { label: "Deals Closed", val: data.crm.closedDeals, color: "#38bdf8" },
                { label: "Pipeline Value", val: fmt(data.crm.pipelineValue), color: "#f97316" },
              ].map((k, i) => (
                <div className="card-sm" key={i}>
                  <div className="stat-label">{k.label}</div>
                  <div className="stat-val" style={{ color: k.color, fontSize: typeof k.val === "string" ? 22 : 32 }}>{k.val}</div>
                </div>
              ))}
            </div>

            {/* Kanban-style pipeline */}
            <div>
              <div className="section-title">Deal Pipeline</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                {["Lead", "Proposal", "Negotiation", "Active"].map(stage => (
                  <div key={stage} style={{ background: "#0d0f12", border: "1px solid #1e2530", padding: 16, minHeight: 180 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                      <div style={{ width: 8, height: 8, background: statusColor(stage) }} />
                      <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#64748b" }}>{stage}</span>
                    </div>
                    {data.crm.clients.filter(c => c.stage === stage).map((c, i) => (
                      <div key={i} style={{ background: "#13161c", border: "1px solid #1e2530", padding: "12px 14px", marginBottom: 8, borderLeft: `3px solid ${statusColor(stage)}` }}>
                        <div style={{ fontSize: 12, color: "#cbd5e1", fontWeight: 500 }}>{c.name}</div>
                        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 700, color: "#f1f5f9", marginTop: 4 }}>{fmt(c.value)}</div>
                        <div style={{ fontSize: 10, color: "#4b5563", marginTop: 6 }}>{c.next}</div>
                      </div>
                    ))}
                    {data.crm.clients.filter(c => c.stage === stage).length === 0 && (
                      <div style={{ fontSize: 11, color: "#2d3748", textAlign: "center", paddingTop: 30 }}>No clients</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
