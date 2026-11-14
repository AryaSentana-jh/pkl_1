"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAmbilData } from "@/lib/useAmbilData";
import { ambilSemuaPermintaanTukarCuti, responTukarCutiHrd } from "@/lib/data";
import { formatTanggal } from "@/lib/waktu";
import KepalaHalaman from "@/components/KepalaHalaman";
import Ikon from "@/components/Ikon";
import Memuat from "@/components/Memuat";
import Kosong from "@/components/Kosong";
import Gagal from "@/components/Gagal";
import PilStatus from "@/components/PilStatus";

const saringan = [
  { nilai: "semua", label: "Semua" },
  { nilai: "menunggu_hrd", label: "Menunggu HRD" },
  { nilai: "disetujui_hrd", label: "Disetujui HRD" },
  { nilai: "ditolak_hrd", label: "Ditolak HRD" },
];

export default function HalamanPersetujuanTukarCuti() {
  const dariAlamat = useSearchParams().get("status");
  const statusSaringan = saringan.some((s) => s.nilai === dariAlamat) ? dariAlamat : "semua";

  const { status: keadaan, data, cobaLagi } = useAmbilData(
    () => ambilSemuaPermintaanTukarCuti(statusSaringan),
    [statusSaringan]
  );

  const [catatanHrd, setCatatanHrd] = useState({});
  const [pesan, setPesan] = useState("");
  const [prosesId, setProsesId] = useState(null);

  async function putuskan(id, setuju) {
    try {
      setProsesId(id);
      const catatan = catatanHrd[id] || "";
      await responTukarCutiHrd({
        id,
        setuju,
        catatanHrd: catatan,
      });

      setPesan(
        setuju
          ? `Permintaan #${id} telah DISETUJUI. Jadwal kedua karyawan telah otomatis saling ditukar di sistem!`
          : `Permintaan #${id} telah DITOLAK. Jadwal masing-masing karyawan tetap seperti semula.`
      );
      cobaLagi();
    } catch (err) {
      setPesan(`Gagal: ${err.message}`);
    } finally {
      setProsesId(null);
    }
  }

  return (
    <div className="space-y-8">
      <KepalaHalaman
        judul="Persetujuan Tukar Cuti"
        keterangan="Tinjau dan putuskan permohonan pertukaran jadwal antar karyawan yang telah disetujui rekan kerja."
        warna="tinta"
        ikon="tukar"
      />

      {/* Saringan Status */}
      <nav aria-label="Saringan status" className="flex flex-wrap gap-2">
        {saringan.map((s) => (
          <Link
            key={s.nilai}
            href={s.nilai === "semua" ? "/admin/tukar-cuti" : `/admin/tukar-cuti?status=${s.nilai}`}
            aria-current={statusSaringan === s.nilai ? "page" : undefined}
            className={`rounded-full border border-tinta/10 px-5 py-2 text-sm font-semibold transition ${
              statusSaringan === s.nilai
                ? "bg-kunyit text-tinta shadow-tipis font-bold"
                : "bg-panel text-tinta hover:bg-krem"
            }`}
          >
            {s.label}
          </Link>
        ))}
      </nav>

      {pesan && (
        <div className="flex items-center justify-between rounded-xl border border-tinta/10 bg-krem p-4 font-bold text-tinta shadow-tipis">
          <span>{pesan}</span>
          <button onClick={() => setPesan("")} className="text-redup hover:text-tinta">
            <Ikon nama="silang" className="h-4 w-4" />
          </button>
        </div>
      )}

      {keadaan === "memuat" && (
        <div className="kartu p-8">
          <Memuat />
        </div>
      )}

      {keadaan === "gagal" && (
        <div className="kartu p-8">
          <Gagal onCobaLagi={cobaLagi} />
        </div>
      )}

      {keadaan === "berhasil" && data && (
        <>
          {data.length === 0 ? (
            <div className="kartu p-8">
              <Kosong
                teks={
                  statusSaringan === "menunggu_hrd"
                    ? "Semua permohonan tukar cuti sudah diputuskan oleh HRD."
                    : "Tidak ada permohonan tukar cuti dengan status ini."
                }
              />
            </div>
          ) : (
            <ul className="space-y-6">
              {data.map((t) => (
                <li key={t.id} className="kartu overflow-hidden shadow-kartu">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-tinta/10 bg-krem px-6 py-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-tinta text-lg">
                          {t.namaPemohon} ⇄ {t.namaRekan}
                        </span>
                        <span className="rounded-md bg-panel px-2 py-0.5 text-xs font-bold text-redup border border-tinta/10">
                          {t.id}
                        </span>
                      </div>
                      <p className="text-xs text-redup mt-0.5">
                        Diajukan pada {formatTanggal(t.diajukanPada)}
                      </p>
                    </div>
                    <PilStatus status={t.status} />
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Alasan dan Catatan Rekan */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-xl border border-tinta/10 bg-latar p-4 text-sm">
                        <p className="text-xs font-bold text-redup uppercase">Alasan dari {t.namaPemohon}:</p>
                        <p className="mt-1 font-medium text-teks italic">&ldquo;{t.alasan}&rdquo;</p>
                      </div>
                      <div className="rounded-xl border border-tinta/10 bg-latar p-4 text-sm">
                        <p className="text-xs font-bold text-redup uppercase">Respon {t.namaRekan}:</p>
                        <p className="mt-1 font-medium text-teks italic">
                          &ldquo;{t.catatanRekan || "Menyetujui pertukaran."}&rdquo;
                        </p>
                      </div>
                    </div>

                    {/* Detail Jadwal yang Saling Ditukarkan */}
                    <div className="rounded-2xl border border-tinta/10 bg-latar/50 p-5 space-y-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-tinta">
                        Rincian Pertukaran Jadwal:
                      </p>

                      <div className="grid gap-4 sm:grid-cols-2">
                        {/* Jadwal Pemohon */}
                        <div className="rounded-xl border border-tinta/10 bg-panel p-4 space-y-1">
                          <span className="text-xs font-bold text-sedap uppercase">Jadwal Asal {t.namaPemohon}:</span>
                          <p className="text-base font-extrabold text-tinta tabular-nums">
                            {formatTanggal(t.jadwalPemohon.tanggalMulai)} – {formatTanggal(t.jadwalPemohon.tanggalSelesai)}
                          </p>
                          <p className="text-xs text-redup font-medium">
                            Durasi: {t.jadwalPemohon.lama} hari · Alasan: {t.jadwalPemohon.alasan}
                          </p>
                          <p className="text-xs font-semibold text-sedap pt-1">
                            ➜ Akan diberikan kepada: <strong>{t.namaRekan}</strong>
                          </p>
                        </div>

                        {/* Jadwal Rekan */}
                        <div className="rounded-xl border border-tinta/10 bg-panel p-4 space-y-1">
                          <span className="text-xs font-bold text-amber-800 uppercase">Jadwal Asal {t.namaRekan}:</span>
                          <p className="text-base font-extrabold text-tinta tabular-nums">
                            {formatTanggal(t.jadwalRekan.tanggalMulai)} – {formatTanggal(t.jadwalRekan.tanggalSelesai)}
                          </p>
                          <p className="text-xs text-redup font-medium">
                            Durasi: {t.jadwalRekan.lama} hari · Alasan: {t.jadwalRekan.alasan}
                          </p>
                          <p className="text-xs font-semibold text-sedap pt-1">
                            ➜ Akan diberikan kepada: <strong>{t.namaPemohon}</strong>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Keputusan HRD */}
                    {t.status === "menunggu_hrd" ? (
                      <div className="border-t border-tinta/10 pt-5 space-y-4">
                        <div>
                          <label htmlFor={`catatan-hrd-${t.id}`} className="label">
                            Catatan Keputusan HRD
                          </label>
                          <input
                            id={`catatan-hrd-${t.id}`}
                            type="text"
                            placeholder="Tuliskan catatan atau instruksi penyesuaian jadwal dapur/operasional..."
                            value={catatanHrd[t.id] || ""}
                            onChange={(e) =>
                              setCatatanHrd({ ...catatanHrd, [t.id]: e.target.value })
                            }
                            className="isian"
                          />
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <button
                            type="button"
                            disabled={prosesId === t.id}
                            onClick={() => putuskan(t.id, true)}
                            className="tombol-utama"
                          >
                            <Ikon nama="centang" />
                            Setujui Pertukaran
                          </button>
                          <button
                            type="button"
                            disabled={prosesId === t.id}
                            onClick={() => putuskan(t.id, false)}
                            className="tombol border border-red-300 bg-panel text-red-700 hover:bg-red-50"
                          >
                            <Ikon nama="silang" />
                            Tolak
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-tinta/20 bg-latar p-4 text-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-terong">
                          Keputusan & Catatan HRD
                        </p>
                        <p className="mt-1 font-semibold text-tinta">
                          {t.catatanHrd || <span className="text-redup">Tanpa catatan keputusan.</span>}
                        </p>
                        {t.diputuskanHrdPada && (
                          <p className="mt-1 text-xs text-redup">
                            Diputuskan pada: {formatTanggal(t.diputuskanHrdPada)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
