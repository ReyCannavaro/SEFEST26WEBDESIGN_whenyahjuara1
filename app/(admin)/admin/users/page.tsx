"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Modal from "@/components/ui/Modal";
import { toast, ToastContainer } from "@/components/ui/Toast";
import {
  Users, Search, X, ChevronLeft, ChevronRight,
  Shield, Store, User, RefreshCw, Phone, Mail,
  Calendar, CheckCircle2, Edit2, Filter,
} from "lucide-react";

type UserRole = "user" | "vendor" | "admin";

interface UserItem {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  created_at: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
  });
}

const ROLE_CONFIG: Record<UserRole, {
  label: string; color: string; bg: string; border: string;
  icon: React.ReactNode;
}> = {
  admin:  { label: "Admin",  color: "#6D28D9", bg: "#F5F3FF", border: "#DDD6FE", icon: <Shield size={11} /> },
  vendor: { label: "Vendor", color: "#0369A1", bg: "#F0F9FF", border: "#BAE6FD", icon: <Store size={11} /> },
  user:   { label: "User",   color: "#374151", bg: "#F9FAFB", border: "#E5E7EB", icon: <User size={11} /> },
};

const AVATAR_COLORS = ["#0D3B2E", "#1B4332", "#2D6A4F", "#1A5C41", "#245C45"];
const avatarColor = (s: string) => AVATAR_COLORS[s.charCodeAt(0) % AVATAR_COLORS.length];

function RoleBadge({ role }: { role: UserRole }) {
  const c = ROLE_CONFIG[role];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      fontSize: 11, fontWeight: 700, padding: "4px 10px",
      borderRadius: 100, color: c.color, background: c.bg,
      border: `1px solid ${c.border}`,
    }}>
      {c.icon} {c.label}
    </span>
  );
}

function Avatar({ email, name, size = 34 }: { email: string; name: string | null; size?: number }) {
  const initial = (name ?? email)[0].toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `linear-gradient(135deg,${avatarColor(email)},#2D6A4F)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 800, color: "white",
    }}>
      {initial}
    </div>
  );
}

function ChangeRoleModal({ user, onClose, onDone }: {
  user: UserItem; onClose: () => void; onDone: () => void;
}) {
  const [selected, setSelected] = useState<UserRole>(user.role);
  const [loading, setLoading]   = useState(false);

  const ROLES: { value: UserRole; label: string; desc: string }[] = [
    { value: "user",   label: "User",   desc: "Dapat mencari dan booking vendor." },
    { value: "vendor", label: "Vendor", desc: "Dapat mengelola toko dan menerima booking." },
    { value: "admin",  label: "Admin",  desc: "Akses penuh ke semua fitur admin panel." },
  ];

  const handleSave = async () => {
    if (selected === user.role) { onClose(); return; }
    setLoading(true);
    try {
      const res  = await fetch("/api/v1/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id, role: selected }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? "Gagal mengubah role.");
      toast.success(`Role ${user.email} berhasil diubah ke "${selected}".`);
      onDone();
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "#F7F7F4", borderRadius: 12 }}>
        <Avatar email={user.email} name={user.full_name} size={40} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user.full_name ?? "—"}
          </p>
          <p style={{ fontSize: 12, color: "#6B7280", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user.email}
          </p>
        </div>
        <RoleBadge role={user.role} />
      </div>

      <div>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#374151", margin: "0 0 10px" }}>Pilih Role Baru:</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {ROLES.map((r) => {
            const isSelected = selected === r.value;
            const cfg = ROLE_CONFIG[r.value];
            const RoleIcon = r.value === "admin" ? Shield : r.value === "vendor" ? Store : User;
            return (
              <button
                key={r.value}
                onClick={() => setSelected(r.value)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 14px", borderRadius: 12,
                  border: `2px solid ${isSelected ? cfg.border : "#E5E7EB"}`,
                  background: isSelected ? cfg.bg : "white",
                  cursor: "pointer", fontFamily: "inherit",
                  textAlign: "left", transition: "all 0.15s",
                }}
              >
                <div style={{
                  width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                  border: `2px solid ${isSelected ? cfg.color : "#D1D5DB"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {isSelected && <div style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.color }} />}
                </div>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: isSelected ? cfg.bg : "#F7F7F4",
                  border: `1px solid ${isSelected ? cfg.border : "#EBEBEB"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: isSelected ? cfg.color : "#9CA3AF",
                }}>
                  <RoleIcon size={15} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: isSelected ? cfg.color : "#111827", margin: 0 }}>{r.label}</p>
                  <p style={{ fontSize: 12, color: "#6B7280", margin: 0 }}>{r.desc}</p>
                </div>
                {isSelected && <CheckCircle2 size={16} color={cfg.color} style={{ flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>
      </div>

      {selected === "admin" && (
        <div style={{ background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#92400E" }}>
          Memberikan akses admin akan memberikan kontrol penuh ke semua fitur platform.
        </div>
      )}
      {selected === "user" && user.role === "vendor" && (
        <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#92400E" }}>
          Menurunkan role vendor ke user akan otomatis menonaktifkan toko vendor mereka.
        </div>
      )}

      <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
        <button
          onClick={onClose}
          disabled={loading}
          style={{ flex: 1, padding: "12px", borderRadius: 10, border: "1.5px solid #E5E7EB", background: "white", fontSize: 14, fontWeight: 600, color: "#374151", cursor: "pointer", fontFamily: "inherit" }}
        >
          Batal
        </button>
        <button
          onClick={handleSave}
          disabled={loading || selected === user.role}
          style={{
            flex: 2, padding: "12px", borderRadius: 10, border: "none",
            background: selected === user.role || loading ? "#F3F4F6" : "#0D3B2E",
            color: selected === user.role || loading ? "#9CA3AF" : "white",
            fontSize: 14, fontWeight: 700,
            cursor: selected === user.role || loading ? "not-allowed" : "pointer",
            fontFamily: "inherit", transition: "all 0.2s",
          }}
        >
          {loading ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>
    </div>
  );
}

function UserCard({ user, onEdit }: { user: UserItem; onEdit: () => void }) {
  return (
    <div style={{
      padding: "14px 16px", borderBottom: "1px solid #F3F4F6",
      display: "flex", alignItems: "center", gap: 12,
    }}>
      <Avatar email={user.email} name={user.full_name} size={40} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
          <p style={{ fontSize: 13.5, fontWeight: 700, color: "#111827", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>
            {user.full_name ?? <span style={{ color: "#D1D5DB", fontWeight: 400 }}>Tanpa nama</span>}
          </p>
          <RoleBadge role={user.role} />
        </div>
        <p style={{ fontSize: 12, color: "#6B7280", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {user.email}
        </p>
        <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0 }}>
          {user.phone ? user.phone : "—"} · {formatDate(user.created_at)}
        </p>
      </div>
      <button
        onClick={onEdit}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 34, height: 34, borderRadius: 10,
          border: "1px solid #E5E7EB", background: "#F7F7F4",
          cursor: "pointer", color: "#374151", flexShrink: 0,
          transition: "all 0.18s",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#0D3B2E"; (e.currentTarget as HTMLButtonElement).style.color = "white"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#F7F7F4"; (e.currentTarget as HTMLButtonElement).style.color = "#374151"; }}
      >
        <Edit2 size={14} />
      </button>
    </div>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers]             = useState<UserItem[]>([]);
  const [loading, setLoading]         = useState(true);
  const [page, setPage]               = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [total, setTotal]             = useState(0);
  const [roleFilter, setRoleFilter]   = useState("");
  const [search, setSearch]           = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [editTarget, setEditTarget]   = useState<UserItem | null>(null);
  const [filterOpen, setFilterOpen]   = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const fetchUsers = useCallback(async (p: number, role: string, q: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), per_page: "20" });
      if (role) params.set("role", role);
      if (q)    params.set("q", q);
      const res  = await fetch(`/api/v1/admin/users?${params}`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.data.users);
        setTotalPages(data.data.total_pages);
        setTotal(data.data.total);
      }
    } catch {
      toast.error("Gagal memuat data user.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(page, roleFilter, search);
  }, [page, roleFilter, search, fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchInput.trim();
    if (q !== search) { setSearch(q); setPage(1); }
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  const handleRoleFilter = (role: string) => {
    setRoleFilter(role);
    setPage(1);
    setFilterOpen(false);
  };

  const ROLE_TABS: { value: string; label: string; icon: React.ReactNode }[] = [
    { value: "",       label: "Semua",  icon: <Users size={13} /> },
    { value: "user",   label: "User",   icon: <User size={13} /> },
    { value: "vendor", label: "Vendor", icon: <Store size={13} /> },
    { value: "admin",  label: "Admin",  icon: <Shield size={13} /> },
  ];

  const statCards = [
    { label: "Total Terdaftar", val: total,                                          icon: <Users size={20} />,  color: "#0D3B2E", bg: "#ECFDF5" },
    { label: "Vendor",          val: users.filter(u => u.role === "vendor").length,  icon: <Store size={20} />,  color: "#0369A1", bg: "#F0F9FF" },
    { label: "Admin",           val: users.filter(u => u.role === "admin").length,   icon: <Shield size={20} />, color: "#6D28D9", bg: "#F5F3FF" },
  ];

  const activeRoleLabel = ROLE_TABS.find(t => t.value === roleFilter)?.label ?? "Semua";

  return (
    <>
      <style>{`
        @keyframes au-fadeUp  { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes au-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

        .au-ubah-btn:hover { background:#0D3B2E !important; color:white !important; border-color:#0D3B2E !important; }
        .au-srch-btn:hover { background:#145740 !important; }
        .au-ref-btn:hover  { background:#F3F9F5 !important; color:#0D3B2E !important; }
        .au-tab-btn:hover  { color:#0D3B2E !important; background:#F0FAF4 !important; }
        .au-user-row:hover { background:#F7F7F4 !important; }

        .au-stat-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:20px; }
        @media (max-width: 639px) {
          .au-stat-grid { grid-template-columns:repeat(3,1fr); gap:10px; }
          .au-stat-val  { font-size:20px !important; }
          .au-stat-pad  { padding:14px 12px !important; gap:10px !important; }
          .au-stat-icon { width:36px !important; height:36px !important; border-radius:10px !important; }
          .au-stat-lbl  { font-size:10px !important; }
        }

        .au-toolbar { padding:12px 16px; border-bottom:1px solid #F3F4F6; display:flex; align-items:center; gap:8px; flex-wrap:nowrap; }
        @media (max-width: 639px) {
          .au-toolbar   { flex-wrap:wrap; padding:10px 12px; gap:8px; }
          .au-tabs-row  { display:none !important; }
          .au-mobile-filter { display:flex !important; }
        }
        @media (min-width: 640px) {
          .au-mobile-filter { display:none !important; }
          .au-tabs-row      { display:flex; }
        }

        .au-table-wrap { display:block; overflow-x:auto; }
        .au-cards-wrap { display:none; }
        @media (max-width: 767px) {
          .au-table-wrap { display:none; }
          .au-cards-wrap { display:block; }
        }

        .au-pagination { display:flex; align-items:center; justify-content:space-between; padding:10px 16px; border-top:1px solid #F3F4F6; gap:8px; flex-wrap:wrap; }
        .au-page-info  { font-size:12px; color:#9CA3AF; }
        .au-page-btns  { display:flex; gap:6px; }
        .au-page-btn   { display:flex; align-items:center; gap:4px; padding:7px 12px; border-radius:100px; border:1px solid #EBEBEB; background:white; font-size:12px; font-weight:600; cursor:pointer; font-family:inherit; white-space:nowrap; }
        @media (max-width: 639px) {
          .au-pagination { padding:10px 12px; }
          .au-page-info  { font-size:11px; }
          .au-page-btn   { padding:6px 10px; font-size:11px; }
        }
      `}</style>
      <ToastContainer />

      <div className="au-stat-grid">
        {statCards.map(s => (
          <div key={s.label} className="au-stat-pad" style={{ background:"white", borderRadius:14, border:"1px solid #EBEBEB", padding:"18px 20px", display:"flex", alignItems:"center", gap:14 }}>
            <div className="au-stat-icon" style={{ width:44, height:44, borderRadius:12, background:s.bg, display:"grid", placeItems:"center", flexShrink:0, color:s.color }}>
              {s.icon}
            </div>
            <div style={{ minWidth: 0 }}>
              <p className="au-stat-lbl" style={{ fontSize:12, color:"#9CA3AF", margin:"0 0 2px", fontWeight:500 }}>{s.label}</p>
              <p className="au-stat-val" style={{ fontSize:24, fontWeight:800, color:"#111827", margin:0, lineHeight:1 }}>
                {s.val.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background:"white", borderRadius:16, border:"1px solid #EBEBEB", overflow:"hidden" }}>
        <div className="au-toolbar">
          <form onSubmit={handleSearch} style={{ display:"flex", gap:7, flex:"1 1 180px", minWidth:0 }}>
            <div style={{ flex:1, position:"relative", minWidth:0 }}>
              <Search size={13} color="#9CA3AF" style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} />
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Cari nama atau email..."
                style={{ width:"100%", padding:"9px 32px 9px 30px", borderRadius:9, border:"1.5px solid #E5E7EB", fontSize:13, color:"#111827", outline:"none", fontFamily:"inherit", boxSizing:"border-box", background:"#FAFAFA" }}
                onFocus={e => { e.target.style.borderColor = "#0D3B2E"; }}
                onBlur={e => { e.target.style.borderColor = "#E5E7EB"; }}
              />
              {searchInput && (
                <button type="button" onClick={clearSearch}
                  style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#9CA3AF", display:"flex", padding:0 }}>
                  <X size={13} />
                </button>
              )}
            </div>
            <button type="submit" className="au-srch-btn"
              style={{ padding:"9px 13px", borderRadius:9, background:"#0D3B2E", color:"white", fontSize:13, fontWeight:700, border:"none", cursor:"pointer", fontFamily:"inherit", transition:"background 0.15s", display:"flex", alignItems:"center", gap:5, flexShrink:0 }}>
              <Search size={13} /> Cari
            </button>
          </form>

          <div className="au-tabs-row" style={{ gap:3, background:"#F7F7F4", padding:"3px", borderRadius:9, flexShrink:0 }}>
            {ROLE_TABS.map(t => {
              const active = roleFilter === t.value;
              return (
                <button key={t.value} onClick={() => handleRoleFilter(t.value)} className="au-tab-btn"
                  style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 11px", borderRadius:7, border:"none", fontSize:12, fontWeight:600, fontFamily:"inherit", cursor:"pointer", transition:"all 0.15s", color:active?"white":"#6B7280", background:active?"#0D3B2E":"transparent", whiteSpace:"nowrap" }}>
                  {t.icon} {t.label}
                </button>
              );
            })}
          </div>

          <div ref={filterRef} className="au-mobile-filter" style={{ position:"relative", flexShrink:0 }}>
            <button onClick={() => setFilterOpen(p => !p)}
              style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 12px", borderRadius:9, border:`1.5px solid ${filterOpen || roleFilter ? "#0D3B2E" : "#E5E7EB"}`, background:roleFilter?"#ECFDF5":"white", fontSize:12, fontWeight:600, color:roleFilter?"#0D3B2E":"#6B7280", cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>
              <Filter size={13} />
              {activeRoleLabel}
            </button>
            {filterOpen && (
              <div style={{ position:"absolute", top:"calc(100% + 4px)", right:0, background:"white", borderRadius:12, border:"1px solid #E5E7EB", boxShadow:"0 8px 24px rgba(0,0,0,0.12)", zIndex:50, overflow:"hidden", minWidth:140 }}>
                {ROLE_TABS.map(t => {
                  const active = roleFilter === t.value;
                  return (
                    <button key={t.value} onClick={() => handleRoleFilter(t.value)}
                      style={{ width:"100%", display:"flex", alignItems:"center", gap:8, padding:"10px 14px", border:"none", borderBottom:"1px solid #F3F4F6", background:active?"#F0FAF4":"white", fontSize:13, fontWeight:active?700:400, color:active?"#0D3B2E":"#374151", cursor:"pointer", fontFamily:"inherit", textAlign:"left" }}>
                      {t.icon} {t.label}
                      {active && <CheckCircle2 size={13} color="#0D3B2E" style={{ marginLeft:"auto" }} />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button onClick={() => fetchUsers(page, roleFilter, search)} className="au-ref-btn"
            style={{ display:"flex", alignItems:"center", gap:5, padding:"8px 11px", borderRadius:9, border:"1px solid #EBEBEB", background:"white", fontSize:12, fontWeight:600, color:"#6B7280", cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s", flexShrink:0 }}>
            <RefreshCw size={13} />
            <span className="au-ref-label" style={{ display:"none" }}>Refresh</span>
          </button>
        </div>

        {!loading && (
          <div style={{ padding:"7px 16px", background:"#FAFAFA", borderBottom:"1px solid #F3F4F6", display:"flex", alignItems:"center", gap:8 }}>
            <p style={{ fontSize:12, color:"#6B7280", margin:0 }}>
              <strong style={{ color:"#111827" }}>{users.length}</strong> dari{" "}
              <strong style={{ color:"#111827" }}>{total.toLocaleString("id-ID")}</strong> user
              {search && <> · Cari: <strong style={{ color:"#0D3B2E" }}>&ldquo;{search}&rdquo;</strong></>}
              {roleFilter && <> · Role: <strong style={{ color:"#0D3B2E" }}>{roleFilter}</strong></>}
            </p>
            {(search || roleFilter) && (
              <button onClick={() => { clearSearch(); setRoleFilter(""); }}
                style={{ fontSize:11, color:"#9CA3AF", background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:3, padding:0, fontFamily:"inherit" }}>
                <X size={11} /> Reset
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div style={{ padding:"14px 16px", display:"flex", flexDirection:"column", gap:9 }}>
            {Array(8).fill(0).map((_, i) => (
              <div key={i} style={{ height:52, borderRadius:10, background:"linear-gradient(90deg,#f0f0ec 25%,#e8e8e4 50%,#f0f0ec 75%)", backgroundSize:"200% 100%", animation:`au-shimmer 1.5s ${i * 0.05}s infinite` }} />
            ))}
          </div>

        ) : users.length === 0 ? (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"60px 24px", textAlign:"center" }}>
            <div style={{ width:52, height:52, borderRadius:16, background:"#F7F7F4", display:"grid", placeItems:"center", marginBottom:12, color:"#D1D5DB" }}>
              <Users size={24} />
            </div>
            <p style={{ fontSize:15, fontWeight:700, color:"#374151", margin:"0 0 5px" }}>Tidak Ada User</p>
            <p style={{ fontSize:13, color:"#9CA3AF", margin:0 }}>
              {search ? `Tidak ditemukan untuk "${search}"` : "Belum ada user terdaftar."}
            </p>
          </div>

        ) : (
          <>
            <div className="au-table-wrap">
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                <thead>
                  <tr style={{ background:"#F7F7F4" }}>
                    {[
                      { h:"User",      icon:<User size={11} /> },
                      { h:"Email",     icon:<Mail size={11} /> },
                      { h:"Telepon",   icon:<Phone size={11} /> },
                      { h:"Role",      icon:<Shield size={11} /> },
                      { h:"Bergabung", icon:<Calendar size={11} /> },
                      { h:"",          icon:null },
                    ].map(col => (
                      <th key={col.h} style={{ padding:"10px 16px", textAlign:"left", fontSize:11, fontWeight:700, color:"#9CA3AF", letterSpacing:"0.06em", textTransform:"uppercase", whiteSpace:"nowrap" }}>
                        <span style={{ display:"flex", alignItems:"center", gap:4 }}>
                          {col.icon && <span style={{ opacity:0.6 }}>{col.icon}</span>}
                          {col.h}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.id} className="au-user-row"
                      style={{ borderTop:"1px solid #F3F4F6", transition:"background 0.12s", animation:`au-fadeUp 0.3s ${i * 0.03}s ease both` }}>
                      <td style={{ padding:"11px 16px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                          <Avatar email={u.email} name={u.full_name} />
                          <p style={{ fontWeight:700, color:"#111827", margin:0, maxWidth:150, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                            {u.full_name ?? <span style={{ color:"#D1D5DB", fontWeight:400 }}>—</span>}
                          </p>
                        </div>
                      </td>
                      <td style={{ padding:"11px 16px", color:"#6B7280", maxWidth:200, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.email}</td>
                      <td style={{ padding:"11px 16px", color:u.phone?"#374151":"#D1D5DB", whiteSpace:"nowrap" }}>{u.phone ?? "—"}</td>
                      <td style={{ padding:"11px 16px" }}><RoleBadge role={u.role} /></td>
                      <td style={{ padding:"11px 16px", color:"#9CA3AF", fontSize:12, whiteSpace:"nowrap" }}>{formatDate(u.created_at)}</td>
                      <td style={{ padding:"11px 16px" }}>
                        <button onClick={() => setEditTarget(u)} className="au-ubah-btn"
                          style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 12px", borderRadius:100, border:"1px solid #EBEBEB", background:"#F7F7F4", fontSize:12, fontWeight:600, color:"#374151", cursor:"pointer", fontFamily:"inherit", transition:"all 0.18s", whiteSpace:"nowrap" }}>
                          <Edit2 size={12} /> Ubah Role
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="au-cards-wrap">
              {users.map((u) => (
                <UserCard key={u.id} user={u} onEdit={() => setEditTarget(u)} />
              ))}
            </div>
          </>
        )}

        {totalPages > 1 && (
          <div className="au-pagination">
            <p className="au-page-info">
              Hal. <strong style={{ color:"#374151" }}>{page}</strong> / {totalPages}
              {" · "}<strong style={{ color:"#374151" }}>{total.toLocaleString("id-ID")}</strong> user
            </p>
            <div className="au-page-btns">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="au-page-btn"
                style={{ color:page===1?"#D1D5DB":"#374151", cursor:page===1?"not-allowed":"pointer" }}
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="au-page-btn"
                style={{ color:page===totalPages?"#D1D5DB":"#374151", cursor:page===totalPages?"not-allowed":"pointer" }}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Ubah Role User" size="sm">
        {editTarget && (
          <ChangeRoleModal
            user={editTarget}
            onClose={() => setEditTarget(null)}
            onDone={() => fetchUsers(page, roleFilter, search)}
          />
        )}
      </Modal>
    </>
  );
}