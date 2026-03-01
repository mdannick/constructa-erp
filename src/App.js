import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const fmt = (n) => new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(n);

const statusColor = (s) => ({
  Paid: "#4ade80", Pending: "#facc15", Overdue: "#f87171",
  "On Site": "#38bdf8", Office: "#a78bfa", Leave: "#fb923c",
  Active: "#4ade80", Proposal: "#facc15", Negotiation: "#38bdf8", Lead: "#fb923c",
}[s] || "#94a3b8");

const tabs = ["Overview", "Finance", "HR & Payroll", "CRM & Clients"];

export default function App() {
  const [active, setActive] = useState("Overview");
  const [invoices, setInvoices] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);

  // Form state
  const [invoiceForm, setInvoiceForm] = useState({ invoice_number: "", client: "", amount: "", status: "Pending", date: "" });
  const [employeeForm, setEmployeeForm] = useState({ name: "", role: "", status: "Office", hours: "" });
  const [clientForm, setClientForm] = useState({ name: "", stage: "Lead", value: "", next_action: "" });

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    const [inv, emp, cli] = await Promise.all([
      supabase.from("invoices").select("*").order("created_at", { ascending: false }),
      supabase.from("employees").select("*").order("created_at", { ascending: false }),
      supabase.from("clients").select("*").order("created_at", { ascending: false }),
    ]);
    setInvoices(inv.data || []);
    setEmployees(emp.data || []);
    setClients(cli.data || []);
    setLoading(false);
  }

  async function addInvoice() {
    await supabase.from("invoices").insert([{ ...invoiceForm, amount: parseFloat(invoiceForm.amount) }]);
    setInvoiceForm({ invoice_number: "", client: "", amount: "", status: "Pending", date: "" });
    setShowInvoiceModal(false);
    fetchAll();
  }

  async function addEmployee() {
    await supabase.from("employees").insert([{ ...employeeForm, hours: parseFloat(employeeForm.hours) }]);
    setEmployeeForm({ name: "", role: "", status: "Office", hours: "" });
    setShowEmployeeModal(false);
    fetchAll();
  }

  async function addClient() {
    await supabase.from("clients").insert([{ ...clientForm, value: parseFloat(clientForm.value) }]);
    setClientForm({ name: "", stage: "Lead", value: "", next_action: "" });
    setShowClientModal(false);
    fetchAll();
  }

  async function deleteInvoice(id) { await supabase.from("invoices").delete().eq("id", id); fetchAll(); }
  async function deleteEmployee(id) { await supabase.from("employees").delete().eq("id", id); fetchAll(); }
  async function deleteClient(id) { await supabase.from("clients").delete().eq("id", id); fetchAll(); }

  // Computed stats
  const revenue = invoices.filter(i => i.status === "Paid").reduce((s, i) => s + i.amount, 0);
  const outstanding = invoices.filter(i => i.status !== "Paid").reduce((s, i) => s + i.amount, 0);
  const activeClients = clients.filter(c => c.stage === "Active").length;
  const onSite = employees.filter(e => e.status === "On Site").length;
  const pipelineValue = clients.reduce((s, c) => s + c.value, 0);

  return (
    <div style={{ minHeight: "100vh", background: "#0d0f12", color: "#e2e8f0", fontFamily: "'DM Mono', 'Courier New', monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Barlow+Condensed:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
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
        .grid4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 16px; }
        @media (max-width: 768px) { .grid4 { grid-template-columns: 1fr 1fr; } .grid2 { grid-template-columns: 1fr; } }
        .section-title { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: #475569; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
        .section-title::after { content: ''; flex: 1; height: 1px; background: #1e2530; }
        .progress-bar { height: 4px; background: #1e2530; border-radius: 0; overflow: hidden; margin-top: 8px; }
        .progress-fill { height: 100%; background: #f97316; }
        .pill { display: inline-flex; align-items: center; gap: 6px; }
        .pill-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
        .btn { font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; padding: 8px 16px; border: 1px solid #f97316; color: #f97316; background: transparent; cursor: pointer; border-radius: 1px; transition: all 0.15s; }
        .btn:hover { background: #f97316; color: #0d0f12; }
        .btn-danger { border-color: #f87171; color: #f87171; font-size: 10px; padding: 4px 10px; }
        .btn-danger:hover { background: #f87171; color: #0d0f12; }
        .tag { font-size: 10px; padding: 2px 6px; background: #1a1e26; border: 1px solid #252b35; color: #64748b; }
        .anim-in { animation: fadeUp 0.4s ease both; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); display: flex; align-items: center; justify-content: center; z-index: 100; }
        .modal { background: #13161c; border: 1px solid #1e2530; padding: 32px; width: 100%; max-width: 480px; border-radius: 2px; }
        .modal-title { font-family: 'Barlow Condensed', sans-serif; font-size: 20px; font-weight: 800; color: #f1f5f9; margin-bottom: 24px; }
        .form-group { margin-bottom: 16px; }
        .form-label { font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: #4b5563; margin-bottom: 6px; display: block; }
        .form-input { width: 100%; background: #0d0f12; border: 1px solid #1e2530; color: #e2e8f0; padding: 10px 12px; font-family: 'DM Mono', monospace; font-size: 12px; border-radius: 1px; outline: none; }
        .form-input:focus { border-color: #f97316; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .loading { display: flex; align-items: center; justify-content: center; height: 200px; font-family: 'Barlow Condensed', sans-serif; font-size: 18px; color: #4b5563; letter-spacing: 0.12em; }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: "1px solid #1a1e26", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 0" }}>
          <div style={{ width: 36, height: 36, background: "#f97316", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0d0f12" strokeWidth="2.5"><polygon points="3 9 12 2 21 9 21 20 3 20"/><rect x="9" y="14" width="6" height="6"/></svg>
          </div>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, fontWeight: 800, letterSpacing: "0.06em", color: "#f1f5f9" }}>CONSTRUCTA ERP</div>
            <div style={{ fontSize: 10, color: "#4b5563", letterSpacing: "0.12em", marginTop: 2 }}>MANAGEMENT SYSTEM</div>
          </div>
        </div>
        <nav style={{ display: "flex", gap: 4 }}>
          {tabs.map(t => <button key={t} className={`tab${active === t ? " active" : ""}`} onClick={() => setActive(t)}>{t}</button>)}
        </nav>
        <div style={{ fontSize: 11, color: "#4b5563", letterSpacing: "0.08em", padding: "18px 0" }}>
          {loading ? <span style={{ color: "#f97316" }}>SYNCING...</span> : <span style={{ color: "#4ade80" }}>● LIVE</span>}
        </div>
      </div>

      <div style={{ padding: "32px", maxWidth: 1400, margin: "0 auto" }}>
        {loading ? (
          <div className="loading">LOADING DATA FROM SUPABASE...</div>
        ) : (
          <>
            {/* OVERVIEW */}
            {active === "Overview" && (
              <div className="anim-in" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 800, color: "#f1f5f9" }}>
                  GOOD MORNING <span className="accent">—</span> HERE'S YOUR SNAPSHOT
                </div>
                <div className="grid4">
                  {[
                    { label: "Revenue (Paid)", val: fmt(revenue), color: "#4ade80" },
                    { label: "Outstanding", val: fmt(outstanding), color: "#facc15" },
                    { label: "Active Clients", val: activeClients, color: "#38bdf8" },
                    { label: "Staff on Site", val: `${onSite}/${employees.length}`, color: "#f97316" },
                  ].map((k, i) => (
                    <div className="card-sm" key={i}>
                      <div className="stat-label">{k.label}</div>
                      <div className="stat-val" style={{ color: k.color }}>{k.val}</div>
                    </div>
                  ))}
                </div>
                <div className="grid2">
                  <div className="card">
                    <div className="section-title">Recent Invoices</div>
                    {invoices.slice(0, 4).map((inv, i) => (
                      <div className="row-item" key={i}>
                        <div>
                          <div style={{ fontSize: 12, color: "#cbd5e1" }}>{inv.client}</div>
                          <div style={{ fontSize: 10, color: "#4b5563", marginTop: 2 }}>{inv.invoice_number}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 700 }}>{fmt(inv.amount)}</div>
                          <span className="badge" style={{ background: `${statusColor(inv.status)}18`, color: statusColor(inv.status) }}>{inv.status}</span>
                        </div>
                      </div>
                    ))}
                    {invoices.length === 0 && <div style={{ fontSize: 12, color: "#4b5563", textAlign: "center", padding: 20 }}>No invoices yet</div>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div className="card">
                      <div className="section-title">Top Clients</div>
                      {clients.slice(0, 3).map((c, i) => (
                        <div className="row-item" key={i}>
                          <div className="pill">
                            <div className="pill-dot" style={{ background: statusColor(c.stage) }} />
                            <div>
                              <div style={{ fontSize: 12, color: "#cbd5e1" }}>{c.name}</div>
                              <div style={{ fontSize: 10, color: "#4b5563" }}>{c.next_action}</div>
                            </div>
                          </div>
                          <span className="tag">{c.stage}</span>
                        </div>
                      ))}
                      {clients.length === 0 && <div style={{ fontSize: 12, color: "#4b5563", textAlign: "center", padding: 20 }}>No clients yet</div>}
                    </div>
                    <div className="card">
                      <div className="section-title">Team Status</div>
                      {employees.slice(0, 3).map((e, i) => (
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
                      {employees.length === 0 && <div style={{ fontSize: 12, color: "#4b5563", textAlign: "center", padding: 20 }}>No employees yet</div>}
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
                  <button className="btn" onClick={() => setShowInvoiceModal(true)}>+ New Invoice</button>
                </div>
                <div className="grid4">
                  {[
                    { label: "Revenue (Paid)", val: fmt(revenue), color: "#4ade80" },
                    { label: "Outstanding", val: fmt(outstanding), color: "#facc15" },
                    { label: "Total Invoices", val: invoices.length, color: "#38bdf8" },
                    { label: "Overdue", val: invoices.filter(i => i.status === "Overdue").length, color: "#f87171" },
                  ].map((k, i) => (
                    <div className="card-sm" key={i}>
                      <div className="stat-label">{k.label}</div>
                      <div className="stat-val" style={{ color: k.color }}>{k.val}</div>
                    </div>
                  ))}
                </div>
                <div className="card">
                  <div className="section-title">All Invoices</div>
                  {invoices.length === 0 ? (
                    <div style={{ fontSize: 12, color: "#4b5563", textAlign: "center", padding: 40 }}>No invoices yet — click "+ New Invoice" to add one</div>
                  ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid #1e2530" }}>
                          {["Invoice", "Client", "Date", "Amount", "Status", ""].map(h => (
                            <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#4b5563", fontWeight: 500 }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {invoices.map((inv, i) => (
                          <tr key={i} style={{ borderBottom: "1px solid #1a1e26" }}>
                            <td style={{ padding: "12px", color: "#f97316", fontWeight: 500 }}>{inv.invoice_number}</td>
                            <td style={{ padding: "12px", color: "#cbd5e1" }}>{inv.client}</td>
                            <td style={{ padding: "12px", color: "#64748b" }}>{inv.date}</td>
                            <td style={{ padding: "12px", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 700 }}>{fmt(inv.amount)}</td>
                            <td style={{ padding: "12px" }}>
                              <span className="badge" style={{ background: `${statusColor(inv.status)}18`, color: statusColor(inv.status) }}>{inv.status}</span>
                            </td>
                            <td style={{ padding: "12px" }}>
                              <button className="btn btn-danger" onClick={() => deleteInvoice(inv.id)}>Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* HR */}
            {active === "HR & Payroll" && (
              <div className="anim-in" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 800, color: "#f1f5f9" }}>HR <span className="accent">&</span> PAYROLL</div>
                  <button className="btn" onClick={() => setShowEmployeeModal(true)}>+ Add Employee</button>
                </div>
                <div className="grid4">
                  {[
                    { label: "Total Staff", val: employees.length, color: "#f1f5f9" },
                    { label: "On Site", val: onSite, color: "#38bdf8" },
                    { label: "In Office", val: employees.filter(e => e.status === "Office").length, color: "#a78bfa" },
                    { label: "On Leave", val: employees.filter(e => e.status === "Leave").length, color: "#fb923c" },
                  ].map((k, i) => (
                    <div className="card-sm" key={i}>
                      <div className="stat-label">{k.label}</div>
                      <div className="stat-val" style={{ color: k.color }}>{k.val}</div>
                    </div>
                  ))}
                </div>
                <div className="card">
                  <div className="section-title">Employee Directory</div>
                  {employees.length === 0 ? (
                    <div style={{ fontSize: 12, color: "#4b5563", textAlign: "center", padding: 40 }}>No employees yet — click "+ Add Employee" to add one</div>
                  ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid #1e2530" }}>
                          {["Name", "Role", "Status", "Hours", ""].map(h => (
                            <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#4b5563", fontWeight: 500 }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {employees.map((e, i) => (
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
                                  <div className="progress-fill" style={{ width: `${Math.min((e.hours / 168) * 100, 100)}%` }} />
                                </div>
                                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15, fontWeight: 600, color: "#f1f5f9" }}>{e.hours}h</span>
                              </div>
                            </td>
                            <td style={{ padding: "14px 12px" }}>
                              <button className="btn btn-danger" onClick={() => deleteEmployee(e.id)}>Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* CRM */}
            {active === "CRM & Clients" && (
              <div className="anim-in" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 800, color: "#f1f5f9" }}>CRM <span className="accent">&</span> CLIENTS</div>
                  <button className="btn" onClick={() => setShowClientModal(true)}>+ New Client</button>
                </div>
                <div className="grid4">
                  {[
                    { label: "Active Clients", val: activeClients, color: "#4ade80" },
                    { label: "Leads", val: clients.filter(c => c.stage === "Lead").length, color: "#facc15" },
                    { label: "Pipeline Value", val: fmt(pipelineValue), color: "#f97316" },
                    { label: "Total Clients", val: clients.length, color: "#38bdf8" },
                  ].map((k, i) => (
                    <div className="card-sm" key={i}>
                      <div className="stat-label">{k.label}</div>
                      <div className="stat-val" style={{ color: k.color, fontSize: typeof k.val === "string" ? 22 : 32 }}>{k.val}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                  {["Lead", "Proposal", "Negotiation", "Active"].map(stage => (
                    <div key={stage} style={{ background: "#0d0f12", border: "1px solid #1e2530", padding: 16, minHeight: 200 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                        <div style={{ width: 8, height: 8, background: statusColor(stage) }} />
                        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#64748b" }}>{stage}</span>
                      </div>
                      {clients.filter(c => c.stage === stage).map((c, i) => (
                        <div key={i} style={{ background: "#13161c", border: "1px solid #1e2530", padding: "12px 14px", marginBottom: 8, borderLeft: `3px solid ${statusColor(stage)}` }}>
                          <div style={{ fontSize: 12, color: "#cbd5e1", fontWeight: 500 }}>{c.name}</div>
                          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 700, color: "#f1f5f9", marginTop: 4 }}>{fmt(c.value)}</div>
                          <div style={{ fontSize: 10, color: "#4b5563", marginTop: 6 }}>{c.next_action}</div>
                          <button className="btn btn-danger" style={{ marginTop: 8 }} onClick={() => deleteClient(c.id)}>Delete</button>
                        </div>
                      ))}
                      {clients.filter(c => c.stage === stage).length === 0 && (
                        <div style={{ fontSize: 11, color: "#2d3748", textAlign: "center", paddingTop: 30 }}>No clients</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Invoice Modal */}
      {showInvoiceModal && (
        <div className="modal-overlay" onClick={() => setShowInvoiceModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">NEW INVOICE</div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Invoice Number</label>
                <input className="form-input" placeholder="INV-001" value={invoiceForm.invoice_number} onChange={e => setInvoiceForm({...invoiceForm, invoice_number: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Client Name</label>
                <input className="form-input" placeholder="Client name" value={invoiceForm.client} onChange={e => setInvoiceForm({...invoiceForm, client: e.target.value})} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Amount (KES)</label>
                <input className="form-input" type="number" placeholder="50000" value={invoiceForm.amount} onChange={e => setInvoiceForm({...invoiceForm, amount: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input className="form-input" type="date" value={invoiceForm.date} onChange={e => setInvoiceForm({...invoiceForm, date: e.target.value})} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-input" value={invoiceForm.status} onChange={e => setInvoiceForm({...invoiceForm, status: e.target.value})}>
                <option>Pending</option><option>Paid</option><option>Overdue</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <button className="btn" style={{ flex: 1 }} onClick={addInvoice}>Save Invoice</button>
              <button className="btn" style={{ borderColor: "#374151", color: "#64748b" }} onClick={() => setShowInvoiceModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Employee Modal */}
      {showEmployeeModal && (
        <div className="modal-overlay" onClick={() => setShowEmployeeModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">ADD EMPLOYEE</div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" placeholder="John Doe" value={employeeForm.name} onChange={e => setEmployeeForm({...employeeForm, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <input className="form-input" placeholder="Site Foreman" value={employeeForm.role} onChange={e => setEmployeeForm({...employeeForm, role: e.target.value})} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-input" value={employeeForm.status} onChange={e => setEmployeeForm({...employeeForm, status: e.target.value})}>
                  <option>Office</option><option>On Site</option><option>Leave</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Hours This Month</label>
                <input className="form-input" type="number" placeholder="160" value={employeeForm.hours} onChange={e => setEmployeeForm({...employeeForm, hours: e.target.value})} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <button className="btn" style={{ flex: 1 }} onClick={addEmployee}>Save Employee</button>
              <button className="btn" style={{ borderColor: "#374151", color: "#64748b" }} onClick={() => setShowEmployeeModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Client Modal */}
      {showClientModal && (
        <div className="modal-overlay" onClick={() => setShowClientModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">NEW CLIENT</div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Client Name</label>
                <input className="form-input" placeholder="Company name" value={clientForm.name} onChange={e => setClientForm({...clientForm, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Deal Value (KES)</label>
                <input className="form-input" type="number" placeholder="100000" value={clientForm.value} onChange={e => setClientForm({...clientForm, value: e.target.value})} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Stage</label>
                <select className="form-input" value={clientForm.stage} onChange={e => setClientForm({...clientForm, stage: e.target.value})}>
                  <option>Lead</option><option>Proposal</option><option>Negotiation</option><option>Active</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Next Action</label>
                <input className="form-input" placeholder="e.g. Send quote" value={clientForm.next_action} onChange={e => setClientForm({...clientForm, next_action: e.target.value})} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <button className="btn" style={{ flex: 1 }} onClick={addClient}>Save Client</button>
              <button className="btn" style={{ borderColor: "#374151", color: "#64748b" }} onClick={() => setShowClientModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}