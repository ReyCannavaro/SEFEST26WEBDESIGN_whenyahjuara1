/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useCallback } from "react";
import Modal from "@/components/ui/Modal";
import { toast, ToastContainer } from "@/components/ui/Toast";
import {
  Clock, CheckCircle2, XCircle, MinusCircle, RefreshCw,
  Store, MapPin, Phone, Mail, User, Calendar,
  FileText, Star, ChevronLeft, ChevronRight, Eye,
  ShieldCheck, AlertTriangle, ExternalLink, Building2,
} from "lucide-react";

type VendorAction = "approve" | "reject" | "deactivate" | "reactivate";
type TabType      = "pending" | "active" | "inactive";

interface VendorUser { id: string; email: string; full_name: string | null; phone: string | null; }
interface VendorItem {
  id: string; store_name: string; slug: string; category: string; city: string;
  whatsapp_number: string; description: string | null;
  is_verified: boolean; is_active: boolean; created_at: string;
  user: VendorUser; rating_avg: number; review_count: number;
}
interface VendorDetail extends VendorItem {
  address: string | null; ktp_signed_url: string | null; selfie_signed_url: string | null;
}

const TAB_CONFIG: Record<TabType, { label: string; apiStatus: string; emptyMsg: string; icon: React.ReactNode }> = {
  pending:  { label: "Menunggu",  apiStatus: "pending",  emptyMsg: "Tidak ada vendor yang menunggu review.", icon: <Clock size={13} /> },
  active:   { label: "Aktif",     apiStatus: "verified", emptyMsg: "Belum ada vendor aktif.",                icon: <CheckCircle2 size={13} /> },
  inactive: { label: "Nonaktif",  apiStatus: "inactive", emptyMsg: "Tidak ada vendor yang dinonaktifkan.",   icon: <MinusCircle size={13} /> },
};

const ACTION_CONFIG: Record<VendorAction, {
  label: string; confirmLabel: string; color: string; bg: string; border: string;
  needsReason: boolean; reasonLabel?: string; reasonPlaceholder?: string;
}> = {
  approve:    { label: "Setujui & Verifikasi", confirmLabel: "Ya, Verifikasi Sekarang", color: "#065F46", bg: "#ECFDF5", border: "#A7F3D0", needsReason: false },
  reactivate: { label: "Aktifkan Kembali",     confirmLabel: "Ya, Aktifkan Kembali",   color: "#1E40AF", bg: "#EFF6FF", border: "#BFDBFE", needsReason: false },
  deactivate: { label: "Nonaktifkan",          confirmLabel: "Ya, Nonaktifkan",        color: "#92400E", bg: "#FFFBEB", border: "#FDE68A", needsReason: true, reasonLabel: "Alasan Nonaktivasi", reasonPlaceholder: "Contoh: Vendor melanggar ketentuan layanan." },
  reject:     { label: "Tolak",                confirmLabel: "Ya, Tolak Pendaftaran",  color: "#991B1B", bg: "#FEF2F2", border: "#FECACA", needsReason: true, reasonLabel: "Alasan Penolakan",   reasonPlaceholder: "Contoh: Foto KTP tidak jelas, selfie tidak sesuai." },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function getVendorState(v: VendorItem) {
  if (!v.is_verified && !v.is_active) return { label: "Menunggu Review", color: "#92400E", bg: "#FFFBEB", border: "#FDE68A",  icon: <Clock size={11} /> };
  if (v.is_verified  && v.is_active)  return { label: "Aktif",           color: "#065F46", bg: "#ECFDF5", border: "#A7F3D0",  icon: <CheckCircle2 size={11} /> };
  if (v.is_verified  && !v.is_active) return { label: "Nonaktif",        color: "#6B7280", bg: "#F9FAFB", border: "#E5E7EB",  icon: <MinusCircle size={11} /> };
  return                                    { label: "Unknown",           color: "#6B7280", bg: "#F9FAFB", border: "#E5E7EB",  icon: <XCircle size={11} /> };
}

function getAvailableActions(v: VendorItem): VendorAction[] {
  if (!v.is_verified && !v.is_active) return ["approve", "reject"];
  if (v.is_verified  && v.is_active)  return ["deactivate"];
  if (v.is_verified  && !v.is_active) return ["reactivate", "reject"];
  return ["approve", "reject"];
}

function StatusBadge({ v }: { v: VendorItem }) {
  const s = getVendorState(v);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 100, color: s.color, background: s.bg, border: `1px solid ${s.border}`, whiteSpace: "nowrap" }}>
      {s.icon} {s.label}
    </span>
  );
}

function ReviewModal({ vendor, onClose, onActionDone }: {
  vendor: VendorDetail; onClose: () => void; onActionDone: () => void;
}) {
  const [action,      setAction]      = useState<VendorAction | null>(null);
  const [reason,      setReason]      = useState("");
  const [loading,     setLoading]     = useState(false);
  const [reasonError, setReasonError] = useState("");

  const availableActions = getAvailableActions(vendor);
  const stateInfo        = getVendorState(vendor);
  const cfg              = action ? ACTION_CONFIG[action] : null;

  const handleSubmit = async () => {
    if (!action) return;
    if (cfg?.needsReason && !reason.trim()) { setReasonError(`${cfg.reasonLabel ?? "Alasan"} wajib diisi.`); return; }
    setReasonError(""); setLoading(true);
    try {
      const body = cfg?.needsReason ? { action, reason: reason.trim() } : { action };
      const res  = await fetch(`/api/v1/admin/vendors/${vendor.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? "Gagal");
      const msgs: Record<VendorAction, string> = {
        approve:    `✅ Vendor "${vendor.store_name}" berhasil diverifikasi.`,
        reactivate: `✅ Vendor "${vendor.store_name}" berhasil diaktifkan kembali.`,
        deactivate: `Vendor "${vendor.store_name}" telah dinonaktifkan.`,
        reject:     `Vendor "${vendor.store_name}" ditolak.`,
      };
      toast.success(msgs[action]);
      onActionDone(); onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <div style={{ background: "linear-gradient(135deg, #0D3B2E 0%, #1A5C41 100%)", borderRadius: 16, padding: "20px 22px", marginBottom: 18, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        <div style={{ position: "absolute", bottom: -30, right: 40, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, position: "relative" }}>
          <div>
            <div style={{ marginBottom: 8 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 100, color: stateInfo.color, background: stateInfo.bg, border: `1px solid ${stateInfo.border}` }}>
                {stateInfo.icon} {stateInfo.label}
              </span>
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: "white", margin: "0 0 4px", fontFamily: "Fraunces, serif" }}>{vendor.store_name}</h3>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", margin: 0 }}>/{vendor.slug} · {vendor.category}</p>
          </div>
          {vendor.review_count > 0 && (
            <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: "10px 14px", textAlign: "center", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 2 }}>
                <Star size={14} fill="#F5A623" color="#F5A623" />
                <span style={{ fontSize: 16, fontWeight: 800, color: "white" }}>{Number(vendor.rating_avg).toFixed(1)}</span>
              </div>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", margin: 0 }}>{vendor.review_count} ulasan</p>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>

        {/* Card: Info Toko */}
        <div style={{ background: "#F7F7F4", borderRadius: 14, padding: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "#0D3B2E", display: "grid", placeItems: "center" }}>
              <Building2 size={14} color="white" />
            </div>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#374151", margin: 0, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Info Toko</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { icon: <Store size={13} />,   label: "Nama",      val: vendor.store_name },
              { icon: <FileText size={13} />, label: "Kategori",  val: vendor.category },
              { icon: <MapPin size={13} />,   label: "Kota",      val: vendor.city },
              { icon: <Phone size={13} />,    label: "WhatsApp",  val: vendor.whatsapp_number },
              ...(vendor.address ? [{ icon: <MapPin size={13} />, label: "Alamat", val: vendor.address }] : []),
            ].map(item => (
              <div key={item.label} style={{ display: "flex", gap: 8 }}>
                <span style={{ color: "#9CA3AF", flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 10, color: "#9CA3AF", margin: 0, fontWeight: 600 }}>{item.label}</p>
                  <p style={{ fontSize: 13, color: "#111827", margin: 0, fontWeight: 500, wordBreak: "break-word" }}>{item.val}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "#F7F7F4", borderRadius: 14, padding: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "#1E40AF", display: "grid", placeItems: "center" }}>
              <User size={14} color="white" />
            </div>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#374151", margin: 0, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Data Pemilik</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { icon: <User size={13} />,     label: "Nama",    val: vendor.user.full_name ?? "—" },
              { icon: <Mail size={13} />,     label: "Email",   val: vendor.user.email },
              { icon: <Phone size={13} />,    label: "Telepon", val: vendor.user.phone ?? "—" },
              { icon: <Calendar size={13} />, label: "Daftar",  val: formatDate(vendor.created_at) },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", gap: 8 }}>
                <span style={{ color: "#9CA3AF", flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 10, color: "#9CA3AF", margin: 0, fontWeight: 600 }}>{item.label}</p>
                  <p style={{ fontSize: 13, color: "#111827", margin: 0, fontWeight: 500, wordBreak: "break-word" }}>{item.val}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {vendor.description && (
        <div style={{ background: "#F7F7F4", borderRadius: 14, padding: "14px 16px", marginBottom: 16 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase" as const, letterSpacing: "0.06em", margin: "0 0 6px" }}>Deskripsi Toko</p>
          <p style={{ fontSize: 13, color: "#374151", margin: 0, lineHeight: 1.65 }}>{vendor.description}</p>
        </div>
      )}

      {(vendor.ktp_signed_url || vendor.selfie_signed_url) && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "#6D28D9", display: "grid", placeItems: "center" }}>
              <ShieldCheck size={14} color="white" />
            </div>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#374151", margin: 0, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Dokumen Verifikasi</p>
            <span style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 400 }}>· link berlaku 15 menit</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { url: vendor.ktp_signed_url, label: "Foto KTP" },
              { url: vendor.selfie_signed_url, label: "Selfie + KTP" },
            ].map(doc => (
              <div key={doc.label}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", margin: "0 0 8px", textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>{doc.label}</p>
                {doc.url ? (
                  <a href={doc.url} target="_blank" rel="noreferrer" style={{ display: "block", position: "relative", borderRadius: 12, overflow: "hidden", border: "2px solid #E5E7EB", textDecoration: "none" }}>
                    <img src={doc.url} alt={doc.label} style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }} />
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)", padding: "12px 10px 8px", display: "flex", alignItems: "center", gap: 5 }}>
                      <ExternalLink size={12} color="white" />
                      <span style={{ fontSize: 11, color: "white", fontWeight: 600 }}>Buka Ukuran Penuh</span>
                    </div>
                  </a>
                ) : (
                  <div style={{ aspectRatio: "4/3", background: "#F3F4F6", borderRadius: 12, border: "2px dashed #E5E7EB", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    <FileText size={24} color="#D1D5DB" />
                    <p style={{ fontSize: 12, color: "#9CA3AF", margin: 0 }}>Tidak tersedia</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ background: "#F7F7F4", borderRadius: 16, padding: "18px" }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: "#374151", margin: "0 0 12px", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Keputusan Admin</p>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${availableActions.length}, 1fr)`, gap: 8, marginBottom: action ? 14 : 0 }}>
          {availableActions.map((a) => {
            const c        = ACTION_CONFIG[a];
            const selected = action === a;
            return (
              <button key={a}
                onClick={() => { setAction(a); setReason(""); setReasonError(""); }}
                style={{
                  padding: "11px 10px", borderRadius: 12, fontSize: 13, fontWeight: 700,
                  border: `2px solid ${selected ? c.border : "#E5E7EB"}`,
                  background: selected ? c.bg : "white",
                  color: selected ? c.color : "#6B7280",
                  cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                  boxShadow: selected ? `0 0 0 4px ${c.border}40` : "none",
                }}>
                {c.label}
              </button>
            );
          })}
        </div>

        {action === "reactivate" && (
          <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 10, padding: "10px 14px", marginBottom: 12, fontSize: 13, color: "#1E40AF", display: "flex", gap: 8 }}>
            <CheckCircle2 size={15} style={{ flexShrink: 0, marginTop: 1 }} />
            Vendor sudah pernah terverifikasi. Aktifkan kembali tanpa upload dokumen ulang.
          </div>
        )}
        {action === "deactivate" && (
          <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 10, padding: "10px 14px", marginBottom: 12, fontSize: 13, color: "#92400E", display: "flex", gap: 8 }}>
            <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
            Vendor dapat diaktifkan kembali kapan saja tanpa verifikasi ulang.
          </div>
        )}
        {action === "reject" && vendor.is_verified && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "10px 14px", marginBottom: 12, fontSize: 13, color: "#991B1B", display: "flex", gap: 8 }}>
            <XCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
            Menolak vendor terverifikasi akan mencabut status dan mengubah role akun ke user biasa.
          </div>
        )}

        {action && cfg?.needsReason && (
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 7 }}>
              {cfg.reasonLabel} <span style={{ color: "#DC2626" }}>*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => { setReason(e.target.value); setReasonError(""); }}
              placeholder={cfg.reasonPlaceholder}
              rows={3}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 10, fontSize: 13, border: `1.5px solid ${reasonError ? "#FCA5A5" : "#E5E7EB"}`, outline: "none", fontFamily: "inherit", resize: "vertical", transition: "border-color 0.2s", boxSizing: "border-box" as const, background: "white" }}
              onFocus={e => { e.target.style.borderColor = "#0D3B2E"; }}
              onBlur={e => { e.target.style.borderColor = reasonError ? "#FCA5A5" : "#E5E7EB"; }}
            />
            {reasonError && <p style={{ fontSize: 12, color: "#DC2626", marginTop: 4 }}>{reasonError}</p>}
          </div>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          <button onClick={onClose} disabled={loading}
            style={{ flex: 1, padding: "12px", borderRadius: 10, border: "1.5px solid #E5E7EB", background: "white", fontSize: 14, fontWeight: 600, color: "#374151", cursor: "pointer", fontFamily: "inherit" }}>
            Batal
          </button>
          <button onClick={handleSubmit} disabled={!action || loading}
            style={{
              flex: 2, padding: "12px", borderRadius: 10, fontSize: 14, fontWeight: 700,
              border: "none", fontFamily: "inherit", transition: "all 0.2s",
              cursor: !action || loading ? "not-allowed" : "pointer",
              background: !action ? "#E5E7EB"
                : action === "approve" || action === "reactivate" ? "#0D3B2E"
                : action === "deactivate" ? "#D97706"
                : "#DC2626",
              color: !action ? "#9CA3AF" : "white",
              opacity: loading ? 0.7 : 1,
              boxShadow: action && !loading ? "0 2px 8px rgba(0,0,0,0.15)" : "none",
            }}>
            {loading ? "Memproses..." : cfg?.confirmLabel ?? "Pilih Keputusan"}
          </button>
        </div>
      </div>
    </div>
  );
}

function VendorCard({ v, onKelola, loading }: { v: VendorItem; onKelola: () => void; loading: boolean }) {
  return (
    <div style={{ padding: "16px", borderBottom: "1px solid #F3F4F6" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
        {/* Avatar */}
        <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg, #0D3B2E, #2D6A4F)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: "white", flexShrink: 0 }}>
          {v.store_name[0].toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{v.store_name}</p>
          <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0 }}>{v.category} · {v.city}</p>
        </div>
        <StatusBadge v={v} />
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" as const }}>
        <span style={{ fontSize: 12, color: "#6B7280", display: "flex", alignItems: "center", gap: 3 }}>
          <User size={11} color="#D1D5DB" /> {v.user.full_name ?? "—"}
        </span>
        <span style={{ fontSize: 12, color: "#9CA3AF" }}>·</span>
        <span style={{ fontSize: 12, color: "#6B7280", display: "flex", alignItems: "center", gap: 3 }}>
          <Calendar size={11} color="#D1D5DB" /> {formatDate(v.created_at)}
        </span>
      </div>

      <button onClick={onKelola} disabled={loading}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px", borderRadius: 10, border: "none", background: "#0D3B2E", fontSize: 13, fontWeight: 700, color: "#d8f3dc", cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: loading ? 0.6 : 1 }}>
        <Eye size={14} /> Kelola Vendor Ini
      </button>
    </div>
  );
}

export default function AdminVendorsPage() {
  const [tab,          setTab]          = useState<TabType>("pending");
  const [vendors,      setVendors]      = useState<VendorItem[]>([]);
  const [stats,        setStats]        = useState({ pending: 0, active: 0, inactive: 0 });
  const [loading,      setLoading]      = useState(true);
  const [page,         setPage]         = useState(1);
  const [totalPages,   setTotalPages]   = useState(1);
  const [total,        setTotal]        = useState(0);
  const [reviewTarget, setReviewTarget] = useState<VendorDetail | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchVendors = useCallback(async (t: TabType, p: number) => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/v1/admin/vendors?status=${TAB_CONFIG[t].apiStatus}&page=${p}&per_page=15`);
      const data = await res.json();
      if (data.success) {
        setVendors(data.data.vendors ?? []);
        setTotalPages(data.data.total_pages ?? 1);
        setTotal(data.data.total ?? 0);
      }
    } catch { toast.error("Gagal memuat data vendor."); }
    finally { setLoading(false); }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const [pr, ar, ir] = await Promise.all([
        fetch("/api/v1/admin/vendors?status=pending&per_page=1"),
        fetch("/api/v1/admin/vendors?status=verified&per_page=1"),
        fetch("/api/v1/admin/vendors?status=inactive&per_page=1"),
      ]);
      const [pd, ad, id_] = await Promise.all([pr.json(), ar.json(), ir.json()]);
      setStats({ pending: pd.data?.total ?? 0, active: ad.data?.total ?? 0, inactive: id_.data?.total ?? 0 });
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { setPage(1); }, [tab]);
  useEffect(() => { fetchVendors(tab, page); }, [page, tab, fetchVendors]);

  const openReview = async (id: string) => {
    setModalLoading(true);
    try {
      const res  = await fetch(`/api/v1/admin/vendors/${id}`);
      const data = await res.json();
      if (data.success) setReviewTarget(data.data);
      else toast.error("Gagal memuat detail vendor.");
    } catch { toast.error("Terjadi kesalahan."); }
    finally { setModalLoading(false); }
  };

  const handleActionDone = () => { fetchVendors(tab, page); fetchStats(); };

  return (
    <>
      <style>{`
        @keyframes av-fadeIn  { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes av-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

        .av-stat-grid  { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:20px; }
        .av-stat-card  { background:white; border-radius:14px; border:1px solid #EBEBEB; padding:16px 18px; display:flex; align-items:center; gap:12px; transition:box-shadow 0.2s; }
        .av-stat-card:hover { box-shadow:0 4px 16px rgba(0,0,0,0.07); }

        .av-tab-bar    { display:flex; border-bottom:1px solid #F3F4F6; overflow-x:auto; scrollbar-width:none; }
        .av-tab-bar::-webkit-scrollbar { display:none; }
        .av-tab-btn    { flex-shrink:0; display:flex; align-items:center; gap:6px; padding:13px 18px; font-size:13px; font-weight:600; font-family:inherit; border:none; border-bottom:2.5px solid transparent; background:none; cursor:pointer; transition:all 0.18s; white-space:nowrap; color:#9CA3AF; }
        .av-tab-btn.active { color:#0D3B2E; border-bottom-color:#0D3B2E; }
        .av-tab-btn:hover  { color:#0D3B2E; background:#F3F9F5; }

        .av-table-wrap { display:block; overflow-x:auto; }
        .av-cards-wrap { display:none; }

        .av-vendor-row { transition:background 0.12s; }
        .av-vendor-row:hover { background:#F7F7F4 !important; }

        .av-kelola-btn { display:flex; align-items:center; gap:5px; padding:7px 14px; border-radius:100px; border:1px solid #E5E7EB; background:#F7F7F4; font-size:12px; font-weight:600; color:#374151; cursor:pointer; font-family:inherit; transition:all 0.18s; white-space:nowrap; }
        .av-kelola-btn:hover { background:#0D3B2E !important; color:white !important; border-color:#0D3B2E !important; }

        .av-ref-btn { display:flex; align-items:center; gap:5px; padding:7px 13px; border-radius:100px; border:1px solid #EBEBEB; background:white; font-size:12px; font-weight:600; color:#6B7280; cursor:pointer; font-family:inherit; transition:all 0.15s; white-space:nowrap; }
        .av-ref-btn:hover { background:#F3F9F5 !important; color:#0D3B2E !important; }

        .av-page-btn { display:flex; align-items:center; gap:4px; padding:8px 14px; border-radius:100px; border:1px solid #EBEBEB; background:white; font-size:12px; font-weight:600; font-family:inherit; cursor:pointer; white-space:nowrap; transition:all 0.15s; }
        .av-page-btn:hover:not(:disabled) { background:#F3F9F5; color:#0D3B2E; border-color:#C7DDD1; }

        @media (max-width: 767px) {
          .av-table-wrap { display:none; }
          .av-cards-wrap { display:block; }
          .av-stat-grid  { gap:10px; }
        }
        @media (max-width: 480px) {
          .av-stat-grid  { grid-template-columns:1fr; }
          .av-stat-card  { padding:13px 14px; }
        }
      `}</style>
      <ToastContainer />

      <div className="av-stat-grid">
        {[
          { label: "Menunggu Review", val: stats.pending,  icon: <Clock size={20} />,        color: "#92400E", bg: "#FEF3C7", barColor: "#F59E0B" },
          { label: "Vendor Aktif",    val: stats.active,   icon: <CheckCircle2 size={20} />, color: "#065F46", bg: "#D1FAE5", barColor: "#10B981" },
          { label: "Nonaktif",        val: stats.inactive, icon: <MinusCircle size={20} />,  color: "#374151", bg: "#F3F4F6", barColor: "#6B7280" },
        ].map(s => (
          <div key={s.label} className="av-stat-card">
            <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: "grid", placeItems: "center", flexShrink: 0, color: s.color }}>
              {s.icon}
            </div>
            <div>
              <p style={{ fontSize: 12, color: "#9CA3AF", margin: "0 0 3px", fontWeight: 500 }}>{s.label}</p>
              <p style={{ fontSize: 26, fontWeight: 800, color: "#111827", margin: 0, lineHeight: 1 }}>{s.val}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: "white", borderRadius: 16, border: "1px solid #EBEBEB", overflow: "hidden" }}>
        <div className="av-tab-bar">
          {(Object.keys(TAB_CONFIG) as TabType[]).map((t) => {
            const active = tab === t;
            const cfg    = TAB_CONFIG[t];
            return (
              <button key={t} onClick={() => setTab(t)} className={`av-tab-btn${active ? " active" : ""}`}>
                <span style={{ color: active ? "#0D3B2E" : "#D1D5DB" }}>{cfg.icon}</span>
                {cfg.label}
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 100,
                  background: active ? (t === "pending" ? "#FEF3C7" : t === "active" ? "#D1FAE5" : "#F3F4F6") : "#F3F4F6",
                  color:      active ? (t === "pending" ? "#92400E" : t === "active" ? "#065F46" : "#374151") : "#9CA3AF",
                }}>
                  {stats[t]}
                </span>
              </button>
            );
          })}
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 14px", gap: 8 }}>
            {!loading && total > 0 && (
              <span style={{ fontSize: 11, color: "#9CA3AF" }}>{total} vendor</span>
            )}
            <button onClick={() => { fetchVendors(tab, page); fetchStats(); }} className="av-ref-btn">
              <RefreshCw size={13} /> Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 10 }}>
            {Array(5).fill(0).map((_, i) => (
              <div key={i} style={{ height: 58, borderRadius: 10, background: "linear-gradient(90deg,#f0f0ec 25%,#e8e8e4 50%,#f0f0ec 75%)", backgroundSize: "200% 100%", animation: `av-shimmer 1.5s ${i * 0.07}s infinite` }} />
            ))}
          </div>

        ) : vendors.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "64px 24px", textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "#F7F7F4", display: "grid", placeItems: "center", marginBottom: 14, color: "#D1D5DB" }}>
              <Store size={26} />
            </div>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#374151", margin: "0 0 5px" }}>Tidak Ada Vendor</p>
            <p style={{ fontSize: 13, color: "#9CA3AF", margin: 0 }}>{TAB_CONFIG[tab].emptyMsg}</p>
          </div>

        ) : (
          <>
            <div className="av-table-wrap">
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#F7F7F4" }}>
                    {["Vendor", "Kategori & Kota", "Pemilik", "Terdaftar", "Status", ""].map(h => (
                      <th key={h} style={{ padding: "11px 16px", textAlign: "left" as const, fontSize: 11, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.06em", textTransform: "uppercase" as const, whiteSpace: "nowrap" as const }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((v, i) => (
                    <tr key={v.id} className="av-vendor-row"
                      style={{ borderTop: "1px solid #F3F4F6", animation: `av-fadeIn 0.3s ${i * 0.04}s ease both` }}>
                      <td style={{ padding: "13px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg,#0D3B2E,#2D6A4F)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "white", flexShrink: 0 }}>
                            {v.store_name[0].toUpperCase()}
                          </div>
                          <div>
                            <p style={{ fontWeight: 700, color: "#111827", margin: "0 0 1px", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{v.store_name}</p>
                            <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0 }}>/{v.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "13px 16px" }}>
                        <p style={{ color: "#374151", margin: "0 0 2px", fontWeight: 500 }}>{v.category}</p>
                        <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12, color: "#9CA3AF" }}>
                          <MapPin size={11} color="#D1D5DB" /> {v.city}
                        </span>
                      </td>
                      <td style={{ padding: "13px 16px" }}>
                        <p style={{ color: "#374151", margin: "0 0 2px", fontWeight: 500, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{v.user.full_name ?? "—"}</p>
                        <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{v.user.email}</p>
                      </td>
                      <td style={{ padding: "13px 16px", color: "#9CA3AF", fontSize: 12, whiteSpace: "nowrap" as const }}>{formatDate(v.created_at)}</td>
                      <td style={{ padding: "13px 16px" }}><StatusBadge v={v} /></td>
                      <td style={{ padding: "13px 16px" }}>
                        <button onClick={() => openReview(v.id)} disabled={modalLoading} className="av-kelola-btn" style={{ opacity: modalLoading ? 0.6 : 1 }}>
                          <Eye size={13} /> Kelola
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="av-cards-wrap">
              {vendors.map(v => (
                <VendorCard key={v.id} v={v} loading={modalLoading} onKelola={() => openReview(v.id)} />
              ))}
            </div>
          </>
        )}

        {totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderTop: "1px solid #F3F4F6", flexWrap: "wrap", gap: 8 }}>
            <p style={{ fontSize: 12, color: "#9CA3AF", margin: 0 }}>
              Halaman <strong style={{ color: "#374151" }}>{page}</strong> dari {totalPages}
            </p>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="av-page-btn"
                style={{ color: page === 1 ? "#D1D5DB" : "#374151", cursor: page === 1 ? "not-allowed" : "pointer" }}>
                <ChevronLeft size={14} /> Sebelumnya
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="av-page-btn"
                style={{ color: page === totalPages ? "#D1D5DB" : "#374151", cursor: page === totalPages ? "not-allowed" : "pointer" }}>
                Berikutnya <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal open={!!reviewTarget} onClose={() => setReviewTarget(null)}
        title={`Review Vendor — ${reviewTarget?.store_name ?? ""}`} size="lg">
        {reviewTarget && (
          <ReviewModal vendor={reviewTarget} onClose={() => setReviewTarget(null)} onActionDone={handleActionDone} />
        )}
      </Modal>
    </>
  );
}