"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useAmbilData } from "@/lib/useAmbilData";
import { ambilRekapBulanan } from "@/lib/data";
import { bulanIni, formatBulan } from "@/lib/waktu";
import KepalaHalaman from "@/components/KepalaHalaman";
import Ikon from "@/components/Ikon";
import Memuat from "@/components/Memuat";
import Kosong from "@/components/Kosong";
import Gagal from "@/components/Gagal";

// Laporan bulanan (PRD 4.9). Tanpa pemeriksaan peran, lihat Sesi 6 / Monthly report (PRD 4.9). No role check, see Session 6
export default function HalamanLaporan() {
  const router = useRouter();

  // Bulan disimpan di alamat (?bulan=2026-09) / Month lives in the URL (?bulan=2026-09)
  const dariAlamat = useSearchParams().get("bulan");
  const bulan = /^\d{4}-\d{2}$/.test(dariAlamat ?? "") ? dariAlamat : bulanIni();

  const { status, data, cobaLagi } = useAmbilData(() => ambilRekapBulanan(bulan), [bulan]);

  // Hari hadir terbanyak jadi patokan panjang batang / The highest attendance sets the full bar length
  const terbanyak = data ? Math.max(1, ...data.map((r) => r.hariHadir)) : 1;

  // Ekspor rekap ke CSV dan unduh langsung di browser tanpa library tambahan / Export recap to CSV and download directly in the browser without extra libraries
  function eksporCsv() {
    if (!data || data.length === 0) return;
    const bom = "\uFEFF"; // BOM supaya Excel membaca karakter Indonesia dengan benar / BOM so Excel reads Indonesian characters correctly
    const header = ["Nama", "Hari Hadir", "Terlambat", "Cuti Disetujui (hari)"].join(",");
    const baris = data.map((r) =>
      [`"${r.nama}"`, r.hariHadir, r.terlambat, r.cutiDisetujui].join(",")
    );
    const isi = [bom + header, ...baris].join("\n");
    const blob = new Blob([isi], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Laporan-Kehadiran-${bulan}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-8">
      <KepalaHalaman judul="Laporan" keterangan={`Rekap kehadiran ${formatBulan(bulan)}. Ganti bulan untuk melihat rekap lain.`} warna="tinta" ikon="grafik">
        <label className="flex items-center gap-3 rounded-xl border border-tinta/10 bg-panel px-3 py-1.5 font-bold text-tinta">
          Bulan
          <input
            type="month"
            value={bulan}
            onChange={(e) => e.target.value && router.replace(`/admin/laporan?bulan=${e.target.value}`)}
            className="rounded-lg border border-tinta/15 px-2 py-1"
          />
        </label>

        {/* Tombol ekspor hanya aktif saat data tersedia / Export button is only active when data is available */}
        <button
          onClick={eksporCsv}
          disabled={status !== "berhasil" || !data || data.length === 0}
          className="tombol-kedua flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-40"
          title="Unduh rekap sebagai file CSV yang bisa dibuka di Excel"
        >
          <Ikon nama="unduh" />
          Ekspor CSV
        </button>
      </KepalaHalaman>

      <section className="kartu overflow-hidden">
        {status === "memuat" && <Memuat />}
        {status === "gagal" && (
          <div className="p-5">
            <Gagal onCobaLagi={cobaLagi} />
          </div>
        )}
        {status === "berhasil" && data.length === 0 && (
          <div className="p-5">
            <Kosong teks="Belum ada karyawan terdaftar." />
          </div>
        )}
        {status === "berhasil" && data.length > 0 && (
          <div className="overflow-x-auto">
            <table className="tabel">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th className="w-2/5">Hari Hadir</th>
                  <th className="text-right">Terlambat</th>
                  <th className="text-right">Cuti Disetujui</th>
                </tr>
              </thead>
              <tbody>
                {data.map((r) => (
                  <tr key={r.karyawanId} className="transition hover:bg-krem">
                    <td className="font-bold text-tinta">{r.nama}</td>
                    <td>
                      <div className="flex items-center gap-3">
                        <span className="w-6 text-right font-bold">{r.hariHadir}</span>
                        <span className="h-3 flex-1 overflow-hidden rounded-full bg-latar">
                          <span className="block h-full rounded-full bg-sedap" style={{ width: `${(r.hariHadir / terbanyak) * 100}%` }} />
                        </span>
                      </div>
                    </td>
                    <td className={`text-right font-bold ${r.terlambat > 0 ? "text-red-700" : "text-redup"}`}>{r.terlambat}</td>
                    <td className="text-right">
                      <span className={r.cutiDisetujui > 0 ? "rounded-lg bg-kunyit px-2 py-0.5 font-bold text-tinta" : "font-bold text-redup"}>
                        {r.cutiDisetujui} hari
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Ringkasan total di bawah tabel / Summary totals below the table */}
            <div className="border-t border-tinta/10 bg-latar px-4 py-3 text-sm text-redup">
              <span className="font-semibold text-tinta">{data.length} karyawan</span>
              {" · "}
              Total hadir: <span className="font-semibold text-tinta">{data.reduce((s, r) => s + r.hariHadir, 0)} hari</span>
              {" · "}
              Terlambat: <span className="font-semibold text-red-700">{data.reduce((s, r) => s + r.terlambat, 0)}×</span>
              {" · "}
              Cuti disetujui: <span className="font-semibold text-tinta">{data.reduce((s, r) => s + r.cutiDisetujui, 0)} hari</span>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
