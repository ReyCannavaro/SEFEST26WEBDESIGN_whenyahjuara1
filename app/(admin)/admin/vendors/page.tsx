/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useCallback } from "react";
import { toast, ToastContainer } from "@/components/ui/Toast";
import {
  Clock, CheckCircle2, XCircle, MinusCircle, RefreshCw,
  Store, MapPin, Phone, Mail, User, Calendar,
  FileText, Star, ChevronLeft, ChevronRight, Eye,
  ShieldCheck, AlertTriangle, ExternalLink, Building2,
  Search, Loader2, Check, X, TrendingUp,
} from "lucide-react";

type VendorAction = "approve" | "reject" | "deactivate" | "reactivate";
type TabType = "pending" | "active" | "inactive";

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

const TAB_CONFIG: Record<TabType, { label: string; apiStatus: string; emptyMsg: string }> = {
  pending:  { label: "Menunggu",  apiStatus: "pending",  emptyMsg: "Tidak ada vendor yang menunggu review." },
  active:   { label: "Aktif",     apiStatus: "verified", emptyMsg: "Belum ada vendor aktif." },
  inactive: { label: "Nonaktif",  apiStatus: "inactive", emptyMsg: "Tidak ada vendor yang dinonaktifkan." },
};

const ACTION_CONFIG: Record<VendorAction, {
  label: string; confirmLabel: string; textColor: string; solidBg: string;
  softBg: string; softBorder: string; softText: string;
  needsReason: boolean; reasonLabel?: string; reasonPlaceholder?: string;
}> = {
  approve:    { label: "Setujui & Verifikasi", confirmLabel: "Verifikasi Sekarang",  textColor: "white",   solidBg: "#0D3B2E", softBg: "#ECFDF5", softBorder: "#A7F3D0", softText: "#065F46", needsReason: false },
  reactivate: { label: "Aktifkan Kembali",     confirmLabel: "Aktifkan Kembali",     textColor: "white",   solidBg: "#1D4ED8", softBg: "#EFF6FF", softBorder: "#BFDBFE", softText: "#1E40AF", needsReason: false },
  deactivate: { label: "Nonaktifkan",          confirmLabel: "Ya, Nonaktifkan",      textColor: "white",   solidBg: "#B45309", softBg: "#FFFBEB", softBorder: "#FDE68A", softText: "#92400E", needsReason: true, reasonLabel: "Alasan Nonaktivasi", reasonPlaceholder: "Contoh: Vendor melanggar ketentuan layanan." },
  reject:     { label: "Tolak Pendaftaran",    confirmLabel: "Ya, Tolak",            textColor: "white",   solidBg: "#DC2626", softBg: "#FEF2F2", softBorder: "#FECACA", softText: "#991B1B", needsReason: true, reasonLabel: "Alasan Penolakan",   reasonPlaceholder: "Contoh: Foto KTP tidak jelas, selfie tidak sesuai." },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function getVendorState(v: VendorItem) {
  if (!v.is_verified && !v.is_active) return { label: "Menunggu",  dotColor: "#F59E0B", textColor: "#92400E", bg: "#FFFBEB", border: "#FDE68A" };
  if (v.is_verified  && v.is_active)  return { label: "Aktif",     dotColor: "#10B981", textColor: "#065F46", bg: "#ECFDF5", border: "#A7F3D0" };
  if (v.is_verified  && !v.is_active) return { label: "Nonaktif",  dotColor: "#9CA3AF", textColor: "#374151", bg: "#F9FAFB", border: "#E5E7EB" };
  return                                     { label: "Unknown",   dotColor: "#9CA3AF", textColor: "#374151", bg: "#F9FAFB", border: "#E5E7EB" };
}

function getAvailableActions(v: VendorItem): VendorAction[] {
  if (!v.is_verified && !v.is_active) return ["approve", "reject"];
  if (v.is_verified  && v.is_active)  return ["deactivate"];
  if (v.is_verified  && !v.is_active) return ["reactivate", "reject"];
  return ["approve", "reject"];
}

function StatusPill({ v }: { v: VendorItem }) {
  const s = getVendorState(v);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 700, padding: "4px 10px", borderRadius: 999, color: s.textColor, background: s.bg, border: `1.5px solid ${s.border}`, whiteSpace: "nowrap" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dotColor, flexShrink: 0 }} />
      {s.label}
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

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [onClose]);

  const availableActions = getAvailableActions(vendor);
  const cfg              = action ? ACTION_CONFIG[action] : null;
  const state            = getVendorState(vendor);

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
        approve:    `Vendor "${vendor.store_name}" berhasil diverifikasi dan diaktifkan.`,
        reactivate: `Vendor "${vendor.store_name}" berhasil diaktifkan kembali.`,
        deactivate: `Vendor "${vendor.store_name}" telah dinonaktifkan.`,
        reject:     `Vendor "${vendor.store_name}" berhasil ditolak.`,
      };
      toast.success(msgs[action]);
      onActionDone(); onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally { setLoading(false); }
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px", fontFamily: "Inter, sans-serif",
        animation: "rv-fadeIn 0.2s ease",
      }}>
      <div style={{
        background: "white", borderRadius: 24, width: "100%", maxWidth: 960,
        maxHeight: "calc(100vh - 40px)", display: "flex", flexDirection: "column",
        boxShadow: "0 32px 80px rgba(0,0,0,0.35)",
        animation: "rv-slideUp 0.25s cubic-bezier(0.22,1,0.36,1)",
        overflow: "hidden",
      }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #F0F0EC", display: "flex", alignItems: "center", gap: 14, flexShrink: 0, background: "white" }}>
          <div style={{ width: 44, height: 44, borderRadius: 13, background: "linear-gradient(135deg,#0D3B2E,#2D6A4F)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: "white", flexShrink: 0 }}>
            {vendor.store_name[0].toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" as const }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#111827", margin: 0, letterSpacing: "-0.3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {vendor.store_name}
              </h2>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: 999, color: state.textColor, background: state.bg, border: `1.5px solid ${state.border}`, flexShrink: 0 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: state.dotColor }} />
                {state.label}
              </span>
            </div>
            <p style={{ fontSize: 12.5, color: "#9CA3AF", margin: "2px 0 0" }}>/{vendor.slug} · {vendor.category} · {vendor.city}</p>
          </div>
          {vendor.review_count > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#FFFBEB", border: "1.5px solid #FDE68A", borderRadius: 12, padding: "8px 14px", flexShrink: 0 }}>
              <Star size={15} fill="#F59E0B" color="#F59E0B" />
              <span style={{ fontSize: 15, fontWeight: 800, color: "#92400E" }}>{Number(vendor.rating_avg).toFixed(1)}</span>
              <span style={{ fontSize: 11, color: "#D97706" }}>({vendor.review_count})</span>
            </div>
          )}
          <button onClick={onClose}
            style={{ width: 38, height: 38, borderRadius: 10, border: "1.5px solid #E5E7EB", background: "white", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0, color: "#6B7280", transition: "all 0.15s" }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div style={{ background: "#FAFAF8", border: "1px solid #EBEBEB", borderRadius: 16, padding: "20px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 18 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: "#0D3B2E", display: "grid", placeItems: "center", flexShrink: 0 }}><Building2 size={15} color="white" /></div>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#374151", textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>Info Toko</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { icon: <Store size={13} />,    label: "Nama Toko",  val: vendor.store_name },
                  { icon: <FileText size={13} />, label: "Kategori",   val: vendor.category },
                  { icon: <MapPin size={13} />,   label: "Kota",       val: vendor.city },
                  { icon: <Phone size={13} />,    label: "WhatsApp",   val: vendor.whatsapp_number },
                  ...(vendor.address ? [{ icon: <MapPin size={13} />, label: "Alamat", val: vendor.address }] : []),
                ].map(row => (
                  <div key={row.label} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{ color: "#9CA3AF", flexShrink: 0, marginTop: 3 }}>{row.icon}</span>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 10, color: "#9CA3AF", margin: "0 0 2px", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>{row.label}</p>
                      <p style={{ fontSize: 14, color: "#111827", margin: 0, fontWeight: 500, wordBreak: "break-word", lineHeight: 1.4 }}>{row.val}</p>
                    </div>
                  </div>
                ))}
                {vendor.description && (
                  <div>
                    <p style={{ fontSize: 10, color: "#9CA3AF", margin: "0 0 5px", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Deskripsi</p>
                    <p style={{ fontSize: 13.5, color: "#374151", margin: 0, lineHeight: 1.65 }}>{vendor.description}</p>
                  </div>
                )}
              </div>
            </div>

            <div style={{ background: "#FAFAF8", border: "1px solid #EBEBEB", borderRadius: 16, padding: "20px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 18 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: "#1D4ED8", display: "grid", placeItems: "center", flexShrink: 0 }}><User size={15} color="white" /></div>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#374151", textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>Data Pemilik</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "white", borderRadius: 12, border: "1px solid #E5E7EB", marginBottom: 16 }}>
                <div style={{ width: 46, height: 46, borderRadius: "50%", background: "linear-gradient(135deg,#0D3B2E,#2D6A4F)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 18, color: "white", flexShrink: 0 }}>
                  {(vendor.user.full_name ?? vendor.user.email).charAt(0).toUpperCase()}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 800, color: "#111827", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{vendor.user.full_name ?? "—"}</p>
                  <p style={{ fontSize: 12, color: "#9CA3AF", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{vendor.user.email}</p>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { icon: <Phone size={13} />,    label: "Telepon",    val: vendor.user.phone ?? "—" },
                  { icon: <Mail size={13} />,     label: "Email",      val: vendor.user.email },
                  { icon: <Calendar size={13} />, label: "Terdaftar",  val: formatDate(vendor.created_at) },
                ].map(row => (
                  <div key={row.label} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{ color: "#9CA3AF", flexShrink: 0, marginTop: 3 }}>{row.icon}</span>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 10, color: "#9CA3AF", margin: "0 0 2px", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>{row.label}</p>
                      <p style={{ fontSize: 14, color: "#111827", margin: 0, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis" }}>{row.val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {(vendor.ktp_signed_url || vendor.selfie_signed_url) && (
            <div style={{ background: "#FAFAF8", border: "1px solid #EBEBEB", borderRadius: 16, padding: "20px 22px", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: "#7C3AED", display: "grid", placeItems: "center", flexShrink: 0 }}><ShieldCheck size={15} color="white" /></div>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#374151", textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>Dokumen Verifikasi</span>
                <span style={{ fontSize: 11.5, color: "#9CA3AF", marginLeft: 4 }}>· Link berlaku 15 menit</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[
                  { url: vendor.ktp_signed_url,    label: "Foto KTP",    emoji: "🪪" },
                  { url: vendor.selfie_signed_url, label: "Selfie + KTP", emoji: "🤳" },
                ].map(doc => (
                  <div key={doc.label}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "#6B7280", margin: "0 0 10px", textTransform: "uppercase" as const, letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: 6 }}>
                      <span>{doc.emoji}</span> {doc.label}
                    </p>
                    {doc.url ? (
                      <a href={doc.url} target="_blank" rel="noreferrer"
                        style={{ display: "block", position: "relative", borderRadius: 14, overflow: "hidden", border: "2px solid #E5E7EB", textDecoration: "none" }}>
                        <img src={doc.url} alt={doc.label} style={{ width: "100%", height: 240, objectFit: "cover", display: "block" }} />
                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 55%)", display: "flex", alignItems: "flex-end", padding: "14px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "white", fontWeight: 700, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(6px)", padding: "7px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.2)" }}>
                            <ExternalLink size={13} /> Buka Ukuran Penuh
                          </span>
                        </div>
                      </a>
                    ) : (
                      <div style={{ height: 240, background: "#F3F4F6", borderRadius: 14, border: "2px dashed #E5E7EB", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                        <FileText size={32} color="#D1D5DB" />
                        <p style={{ fontSize: 13, color: "#9CA3AF", margin: 0 }}>Dokumen tidak tersedia</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ background: "#F7F7F4", border: "1px solid #EBEBEB", borderRadius: 16, padding: "20px 22px" }}>
            <p style={{ fontSize: 11, fontWeight: 800, color: "#374151", margin: "0 0 14px", textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>⚡ Keputusan Admin</p>
            <div style={{ display: "flex", gap: 10, marginBottom: action ? 16 : 0, flexWrap: "wrap" as const }}>
              {availableActions.map((a) => {
                const c        = ACTION_CONFIG[a];
                const selected = action === a;
                return (
                  <button key={a}
                    onClick={() => { setAction(a); setReason(""); setReasonError(""); }}
                    style={{
                      flex: "1 1 140px", padding: "12px 18px", borderRadius: 12,
                      fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                      border: `2px solid ${selected ? c.softBorder : "#E5E7EB"}`,
                      background: selected ? c.softBg : "white",
                      color: selected ? c.softText : "#6B7280",
                      transition: "all 0.15s",
                      boxShadow: selected ? `0 0 0 4px ${c.softBorder}80` : "none",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                    }}>
                    {selected && <Check size={14} />}
                    {c.label}
                  </button>
                );
              })}
            </div>

            {action === "reactivate" && (
              <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 12, padding: "12px 16px", marginBottom: 16, fontSize: 13.5, color: "#1E40AF", display: "flex", gap: 10, alignItems: "flex-start" }}>
                <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                Vendor sudah pernah terverifikasi. Dapat diaktifkan kembali tanpa upload dokumen ulang.
              </div>
            )}
            {action === "deactivate" && (
              <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 12, padding: "12px 16px", marginBottom: 16, fontSize: 13.5, color: "#92400E", display: "flex", gap: 10, alignItems: "flex-start" }}>
                <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                Vendor dapat diaktifkan kembali kapan saja oleh admin tanpa verifikasi ulang.
              </div>
            )}
            {action === "reject" && vendor.is_verified && (
              <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 12, padding: "12px 16px", marginBottom: 16, fontSize: 13.5, color: "#991B1B", display: "flex", gap: 10, alignItems: "flex-start" }}>
                <XCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                Menolak vendor terverifikasi akan mencabut status dan mengubah role akun menjadi user biasa.
              </div>
            )}

            {action && cfg?.needsReason && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "#374151", marginBottom: 8, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>
                  {cfg.reasonLabel} <span style={{ color: "#DC2626" }}>*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => { setReason(e.target.value); setReasonError(""); }}
                  placeholder={cfg.reasonPlaceholder}
                  rows={3}
                  style={{ width: "100%", padding: "13px 16px", borderRadius: 12, fontSize: 14, border: `1.5px solid ${reasonError ? "#FCA5A5" : "#E5E7EB"}`, outline: "none", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box" as const, background: "white", lineHeight: 1.6, transition: "border-color 0.15s" }}
                  onFocus={e => { e.target.style.borderColor = "#0D3B2E"; }}
                  onBlur={e => { e.target.style.borderColor = reasonError ? "#FCA5A5" : "#E5E7EB"; }}
                />
                {reasonError && <p style={{ fontSize: 12.5, color: "#DC2626", marginTop: 5, display: "flex", alignItems: "center", gap: 5 }}><AlertTriangle size={12} />{reasonError}</p>}
              </div>
            )}

            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={onClose} disabled={loading}
                style={{ flex: 1, padding: "13px", borderRadius: 12, border: "1.5px solid #E5E7EB", background: "white", fontSize: 14, fontWeight: 700, color: "#374151", cursor: "pointer", fontFamily: "inherit", transition: "background 0.15s" }}>
                Tutup
              </button>
              <button onClick={handleSubmit} disabled={!action || loading}
                style={{
                  flex: 2, padding: "13px", borderRadius: 12, fontSize: 14, fontWeight: 800,
                  border: "none", fontFamily: "inherit", transition: "all 0.15s",
                  cursor: !action || loading ? "not-allowed" : "pointer",
                  background: !action ? "#E5E7EB" : loading ? `${cfg!.solidBg}CC` : cfg!.solidBg,
                  color: !action ? "#9CA3AF" : "white",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  boxShadow: action && !loading ? `0 4px 14px rgba(0,0,0,0.2)` : "none",
                }}>
                {loading
                  ? <><Loader2 size={16} style={{ animation: "spin 0.7s linear infinite" }} /> Memproses...</>
                  : cfg?.confirmLabel ?? "Pilih Keputusan"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes rv-fadeIn   { from{opacity:0} to{opacity:1} }
        @keyframes rv-slideUp  { from{opacity:0;transform:translateY(20px) scale(0.98)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes spin        { to{transform:rotate(360deg)} }
        @media (max-width: 700px) {
          .rv-grid-2col { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function VendorRow({ v, onKelola, loading, idx }: { v: VendorItem; onKelola: () => void; loading: boolean; idx: number }) {
  return (
    <tr className="av-row" style={{ borderTop: "1px solid #F3F4F6", animation: `av-fadeIn 0.25s ${idx * 0.04}s ease both` }}>
      <td style={{ padding: "14px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#0D3B2E,#2D6A4F)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: "white", flexShrink: 0 }}>
            {v.store_name[0].toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontWeight: 700, color: "#111827", margin: "0 0 2px", fontSize: 13.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const, maxWidth: 170 }}>{v.store_name}</p>
            <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0 }}>/{v.slug}</p>
          </div>
        </div>
      </td>
      <td style={{ padding: "14px 18px" }}>
        <p style={{ color: "#374151", margin: "0 0 2px", fontWeight: 600, fontSize: 13 }}>{v.category}</p>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 12, color: "#9CA3AF" }}>
          <MapPin size={11} color="#D1D5DB" /> {v.city}
        </span>
      </td>
      <td style={{ padding: "14px 18px" }}>
        <p style={{ color: "#374151", margin: "0 0 2px", fontWeight: 500, fontSize: 13, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{v.user.full_name ?? "—"}</p>
        <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{v.user.email}</p>
      </td>
      <td style={{ padding: "14px 18px", color: "#9CA3AF", fontSize: 12, whiteSpace: "nowrap" as const }}>{formatDate(v.created_at)}</td>
      <td style={{ padding: "14px 18px" }}><StatusPill v={v} /></td>
      <td style={{ padding: "14px 18px" }}>
        <button onClick={onKelola} disabled={loading} className="av-kelola-btn" style={{ opacity: loading ? 0.5 : 1 }}>
          <Eye size={13} /> Kelola
        </button>
      </td>
    </tr>
  );
}

function VendorCard({ v, onKelola, loading }: { v: VendorItem; onKelola: () => void; loading: boolean }) {
  return (
    <div style={{ padding: "16px 18px", borderBottom: "1px solid #F3F4F6", display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: "linear-gradient(135deg,#0D3B2E,#2D6A4F)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "white", flexShrink: 0 }}>
          {v.store_name[0].toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14.5, fontWeight: 800, color: "#111827", margin: "0 0 3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{v.store_name}</p>
          <p style={{ fontSize: 12, color: "#9CA3AF", margin: 0 }}>{v.category} · {v.city}</p>
        </div>
        <StatusPill v={v} />
      </div>
      <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#6B7280" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><User size={11} color="#D1D5DB" />{v.user.full_name ?? "—"}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Calendar size={11} color="#D1D5DB" />{formatDate(v.created_at)}</span>
      </div>
      <button onClick={onKelola} disabled={loading}
        style={{ width: "100%", padding: "11px", borderRadius: 12, border: "none", background: "#0D3B2E", color: "#d8f3dc", fontSize: 13.5, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: loading ? 0.6 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, transition: "opacity 0.15s" }}>
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
  const [search,       setSearch]       = useState("");
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

  const filtered = vendors.filter(v =>
    !search ||
    v.store_name.toLowerCase().includes(search.toLowerCase()) ||
    v.city.toLowerCase().includes(search.toLowerCase()) ||
    v.user.email.toLowerCase().includes(search.toLowerCase()) ||
    (v.user.full_name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <style>{`
        @keyframes av-fadeIn  { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes av-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes spin       { to{transform:rotate(360deg)} }

        .av-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:24px; }
        .av-stat  { background:white; border-radius:16px; border:1px solid #EBEBEB; padding:18px 20px; display:flex; align-items:center; gap:14px; transition:box-shadow 0.2s, transform 0.2s; cursor:default; }
        .av-stat:hover { box-shadow:0 4px 20px rgba(13,59,46,0.1); transform:translateY(-1px); }

        .av-card  { background:white; border-radius:18px; border:1px solid #EBEBEB; overflow:hidden; }

        .av-tabs  { display:flex; border-bottom:1px solid #F3F4F6; overflow-x:auto; scrollbar-width:none; }
        .av-tabs::-webkit-scrollbar { display:none; }
        .av-tab   { flex-shrink:0; display:flex; align-items:center; gap:6px; padding:14px 20px; font-size:13px; font-weight:600; font-family:inherit; border:none; border-bottom:2.5px solid transparent; background:none; cursor:pointer; transition:all 0.15s; white-space:nowrap; color:#9CA3AF; }
        .av-tab.on { color:#0D3B2E; border-bottom-color:#0D3B2E; background:#FAFAF8; }
        .av-tab:hover:not(.on) { color:#374151; background:#FAFAF8; }

        .av-table-wrap { display:block; overflow-x:auto; }
        .av-cards-wrap { display:none; }
        .av-row { transition:background 0.12s; }
        .av-row:hover { background:#FAFAF8 !important; }

        .av-kelola-btn { display:inline-flex; align-items:center; gap:5px; padding:7px 16px; border-radius:999px; border:1.5px solid #E5E7EB; background:white; font-size:12.5px; font-weight:700; color:#374151; cursor:pointer; font-family:inherit; transition:all 0.15s; white-space:nowrap; }
        .av-kelola-btn:hover:not(:disabled) { background:#0D3B2E; color:white; border-color:#0D3B2E; }
        .av-ref-btn   { display:inline-flex; align-items:center; gap:5px; padding:7px 14px; border-radius:999px; border:1px solid #EBEBEB; background:white; font-size:12px; font-weight:600; color:#6B7280; cursor:pointer; font-family:inherit; transition:all 0.15s; }
        .av-ref-btn:hover { background:#F3F9F5; color:#0D3B2E; border-color:#C7DDD1; }
        .av-page-btn  { display:inline-flex; align-items:center; gap:4px; padding:8px 16px; border-radius:999px; border:1.5px solid #EBEBEB; background:white; font-size:12.5px; font-weight:600; font-family:inherit; cursor:pointer; transition:all 0.15s; color:#374151; }
        .av-page-btn:hover:not(:disabled) { background:#F3F9F5; border-color:#C7DDD1; color:#0D3B2E; }
        .av-page-btn:disabled { color:#D1D5DB; cursor:not-allowed; }

        @media (max-width: 767px) {
          .av-table-wrap { display:none; }
          .av-cards-wrap { display:block; }
          .av-stats { gap:10px; }
        }
        @media (max-width: 520px) {
          .av-stats { grid-template-columns:1fr; gap:8px; }
          .av-stat  { padding:14px 16px; border-radius:14px; }
        }
      `}</style>
      <ToastContainer />

      <div className="av-stats">
        {[
          { label: "Menunggu Review", val: stats.pending,  tabKey: "pending"  as TabType, accent: "#F59E0B", bg: "#FFFBEB", icon: <Clock size={22} color="#D97706" /> },
          { label: "Vendor Aktif",    val: stats.active,   tabKey: "active"   as TabType, accent: "#10B981", bg: "#ECFDF5", icon: <CheckCircle2 size={22} color="#059669" /> },
          { label: "Nonaktif",        val: stats.inactive, tabKey: "inactive" as TabType, accent: "#9CA3AF", bg: "#F9FAFB", icon: <MinusCircle size={22} color="#6B7280" /> },
        ].map(s => (
          <div key={s.label} className="av-stat" onClick={() => setTab(s.tabKey)} style={{ cursor: "pointer" }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: s.bg, display: "grid", placeItems: "center", flexShrink: 0, border: `1.5px solid ${s.accent}30` }}>
              {s.icon}
            </div>
            <div>
              <p style={{ fontSize: 12, color: "#9CA3AF", margin: "0 0 4px", fontWeight: 500 }}>{s.label}</p>
              <p style={{ fontSize: 30, fontWeight: 800, color: "#111827", margin: 0, lineHeight: 1, letterSpacing: "-0.5px" }}>{s.val}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="av-card">
        <div style={{ display: "flex", alignItems: "stretch", borderBottom: "1px solid #F3F4F6", flexWrap: "wrap" as const }}>
          <div className="av-tabs" style={{ flex: 1, borderBottom: "none" }}>
            {(Object.keys(TAB_CONFIG) as TabType[]).map(t => {
              const on  = tab === t;
              const cnt = stats[t];
              const dotColors: Record<TabType, string> = { pending: "#F59E0B", active: "#10B981", inactive: "#9CA3AF" };
              return (
                <button key={t} onClick={() => setTab(t)} className={`av-tab${on ? " on" : ""}`}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: on ? dotColors[t] : "#D1D5DB", flexShrink: 0 }} />
                  {TAB_CONFIG[t].label}
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: on ? "#F3F9F5" : "#F3F4F6", color: on ? "#0D3B2E" : "#9CA3AF", transition: "all 0.15s" }}>
                    {cnt}
                  </span>
                </button>
              );
            })}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderLeft: "1px solid #F3F4F6" }}>
            <button onClick={() => { fetchVendors(tab, page); fetchStats(); }} className="av-ref-btn">
              <RefreshCw size={13} /> Refresh
            </button>
          </div>
        </div>

        <div style={{ padding: "12px 18px", borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "center", gap: 10, background: "#FAFAF8" }}>
          <Search size={15} color="#9CA3AF" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama toko, kota, atau email pemilik..."
            style={{ flex: 1, border: "none", outline: "none", fontSize: 13.5, color: "#111827", background: "transparent", fontFamily: "inherit" }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", color: "#9CA3AF" }}>
              <X size={14} />
            </button>
          )}
          {!loading && <span style={{ fontSize: 11, color: "#9CA3AF", whiteSpace: "nowrap" as const, flexShrink: 0 }}>{filtered.length} vendor</span>}
        </div>

        {loading ? (
          <div style={{ padding: "18px", display: "flex", flexDirection: "column", gap: 10 }}>
            {Array(5).fill(0).map((_, i) => (
              <div key={i} style={{ height: 62, borderRadius: 12, background: "linear-gradient(90deg,#f0f0ec 25%,#e8e8e4 50%,#f0f0ec 75%)", backgroundSize: "200% 100%", animation: `av-shimmer 1.5s ${i * 0.07}s infinite` }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "72px 24px", textAlign: "center" }}>
            <div style={{ width: 60, height: 60, borderRadius: 18, background: "#F7F7F4", display: "grid", placeItems: "center", marginBottom: 16, border: "1px solid #EBEBEB" }}>
              <Store size={28} color="#D1D5DB" />
            </div>
            <p style={{ fontSize: 16, fontWeight: 800, color: "#374151", margin: "0 0 6px" }}>Tidak Ada Vendor</p>
            <p style={{ fontSize: 13.5, color: "#9CA3AF", margin: 0 }}>{search ? `Tidak ada hasil untuk "${search}"` : TAB_CONFIG[tab].emptyMsg}</p>
          </div>
        ) : (
          <>
            <div className="av-table-wrap">
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#FAFAF8" }}>
                    {["Vendor", "Kategori & Kota", "Pemilik", "Terdaftar", "Status", ""].map(h => (
                      <th key={h} style={{ padding: "11px 18px", textAlign: "left" as const, fontSize: 10.5, fontWeight: 800, color: "#9CA3AF", letterSpacing: "0.07em", textTransform: "uppercase" as const, whiteSpace: "nowrap" as const }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((v, i) => (
                    <VendorRow key={v.id} v={v} idx={i} loading={modalLoading} onKelola={() => openReview(v.id)} />
                  ))}
                </tbody>
              </table>
            </div>
            <div className="av-cards-wrap">
              {filtered.map(v => (
                <VendorCard key={v.id} v={v} loading={modalLoading} onKelola={() => openReview(v.id)} />
              ))}
            </div>
          </>
        )}

        {totalPages > 1 && !loading && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderTop: "1px solid #F3F4F6", flexWrap: "wrap" as const, gap: 8 }}>
            <p style={{ fontSize: 12.5, color: "#9CA3AF", margin: 0 }}>
              Halaman <strong style={{ color: "#374151" }}>{page}</strong> dari {totalPages} · {total} vendor
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="av-page-btn">
                <ChevronLeft size={14} /> Sebelumnya
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="av-page-btn">
                Berikutnya <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {reviewTarget && (
        <ReviewModal vendor={reviewTarget} onClose={() => setReviewTarget(null)} onActionDone={handleActionDone} />
      )}
    </>
  );
}