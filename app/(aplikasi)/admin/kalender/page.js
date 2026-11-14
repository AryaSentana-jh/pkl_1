"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useAmbilData } from "@/lib/useAmbilData";
import { ambilJadwalCutiTim } from "@/lib/data";
import { bulanIni, formatBulan, keTanggal } from "@/lib/waktu";
import KepalaHalaman from "@/components/KepalaHalaman";
import Memuat from "@/components/Memuat";
import Kosong from "@/components/Kosong";
import Gagal from "@/components/Gagal";
import PilStatus from "@/components/PilStatus";

// Palet warna untuk membedakan karyawan di kalender / Color palette to distinguish employees in the calendar
const WARNA_KARYAWAN = [
  "bg-sedap/20 text-sedap border-l-2 border-sedap",
  "bg-terong/15 text-terong border-l-2 border-terong",
  "bg-blue-100 text-blue-800 border-l-2 border-blue-500",
  "bg-orange-100 text-orange-800 border-l-2 border-orange-500",
  "bg-pink-100 text-pink-800 border-l-2 border-pink-500",
  "bg-teal-100 text-teal-800 border-l-2 border-teal-500",
  "bg-purple-100 text-purple-800 border-l-2 border-purple-500",
  "bg-amber-100 text-amber-800 border-l-2 border-amber-500",
];

const NAMA_HARI = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const NAMA_HARI_PANJANG = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

// Kalender Cuti Tim: HRD melihat siapa yang cuti di hari apa dalam satu bulan
// Team Leave Calendar: HRD sees who is on leave on which days in a given month
export default function HalamanKalenderCuti() {
  const router = useRouter();
  const dariAlamat = useSearchParams().get("bulan");
  const bulan = /^\d{4}-\d{2}$/.test(dariAlamat ?? "") ? dariAlamat : bulanIni();

  const { status, data, cobaLagi } = useAmbilData(() => ambilJadwalCutiTim(bulan), [bulan]);

  // Hitung awal dan akhir bulan / Calculate start and end of month
  const awalBulan = new Date(`${bulan}-01T00:00:00`);
  const akhirBulan = new Date(awalBulan.getFullYear(), awalBulan.getMonth() + 1, 0);
  const jumlahHari = akhirBulan.getDate();
  const hariAwal = awalBulan.getDay(); // 0 = Minggu / 0 = Sunday

  // Daftar pengajuan yang disetujui untuk diwarnai di kalender / Approved leave requests to color in the calendar
  const disetujui = data?.filter((c) => c.status === "disetujui") ?? [];
  const menunggu = data?.filter((c) => c.status === "menunggu") ?? [];

  // Peta uid -> indeks warna supaya warna konsisten per karyawan / Map uid -> color index so colors are consistent per employee
  const petaWarna = {};
  let indeksWarna = 0;
  for (const c of data ?? []) {
    if (!(c.karyawanId in petaWarna)) {
      petaWarna[c.karyawanId] = indeksWarna++ % WARNA_KARYAWAN.length;
    }
  }

  // Cari semua cuti yang aktif pada tanggal tertentu / Find all leaves active on a given date
  function cutiPadaTanggal(tanggal) {
    if (!data) return [];
    const tgl = new Date(`${tanggal}T00:00:00`);
    return data.filter((c) => c.tanggalMulai <= tgl && tgl <= c.tanggalSelesai);
  }

  // Navigasi bulan sebelum / sesudah / Navigate previous / next month
  function gantibulan(delta) {
    const d = new Date(`${bulan}-01T00:00:00`);
    d.setMonth(d.getMonth() + delta);
    const tahun = d.getFullYear();
    const bln = String(d.getMonth() + 1).padStart(2, "0");
    router.replace(`/admin/kalender?bulan=${tahun}-${bln}`);
  }

  // Semua sel kalender (hari kosong di awal + hari-hari bulan ini) / All calendar cells (blank days at start + this month's days)
  const sel = [];
  for (let i = 0; i < hariAwal; i++) sel.push(null); // sel kosong / blank cells
  for (let d = 1; d <= jumlahHari; d++) sel.push(d);

  return (
    <div className="space-y-8">
      <KepalaHalaman
        judul="Kalender Cuti Tim"
        keterangan={`Jadwal cuti seluruh karyawan bulan ${formatBulan(bulan)}.`}
        warna="tinta"
        ikon="kalender_tim"
      >
        {/* Navigasi bulan / Month navigation */}
        <div className="flex items-center gap-2 rounded-xl border border-tinta/10 bg-panel px-2 py-1">
          <button
            onClick={() => gantibulan(-1)}
            className="rounded-lg p-1.5 text-tinta hover:bg-latar transition"
            aria-label="Bulan sebelumnya"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <label className="flex items-center gap-2 font-bold text-tinta">
            <input
              type="month"
              value={bulan}
              onChange={(e) => e.target.value && router.replace(`/admin/kalender?bulan=${e.target.value}`)}
              className="rounded-lg border border-tinta/15 px-2 py-1 text-sm"
            />
          </label>
          <button
            onClick={() => gantibulan(1)}
            className="rounded-lg p-1.5 text-tinta hover:bg-latar transition"
            aria-label="Bulan berikutnya"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </KepalaHalaman>

      {status === "memuat" && <div className="kartu p-5"><Memuat /></div>}
      {status === "gagal" && <div className="kartu p-5"><Gagal onCobaLagi={cobaLagi} /></div>}

      {status === "berhasil" && (
        <>
          {/* Grid kalender / Calendar grid */}
          <section className="kartu overflow-hidden">
            {/* Header nama hari / Day name header */}
            <div className="grid grid-cols-7 border-b border-tinta/10 bg-latar">
              {NAMA_HARI.map((h, i) => (
                <div
                  key={h}
                  className={`py-2 text-center text-xs font-semibold tracking-wide uppercase ${
                    i === 0 || i === 6 ? "text-red-400" : "text-redup"
                  }`}
                >
                  {h}
                </div>
              ))}
            </div>

            {/* Sel-sel hari / Day cells */}
            <div className="grid grid-cols-7">
              {sel.map((hari, idx) => {
                if (!hari) {
                  // Sel kosong awal bulan / Blank leading cell
                  return <div key={`kosong-${idx}`} className="min-h-24 border-b border-r border-tinta/5 bg-latar/40 last:border-r-0" />;
                }
                const tanggal = `${bulan}-${String(hari).padStart(2, "0")}`;
                const hariKe = new Date(`${tanggal}T00:00:00`).getDay();
                const isWeekend = hariKe === 0 || hariKe === 6;
                const hari_ini = tanggal === keTanggal(new Date());
                const cutiHariIni = cutiPadaTanggal(tanggal);
                const colIdx = (idx) % 7;

                return (
                  <div
                    key={tanggal}
                    className={`relative min-h-24 border-b border-r border-tinta/5 p-1.5 last:border-r-0 ${
                      isWeekend ? "bg-latar/60" : "bg-panel"
                    }`}
                  >
                    {/* Nomor hari / Day number */}
                    <span
                      className={`mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        hari_ini
                          ? "bg-sedap text-white"
                          : isWeekend
                          ? "text-red-400"
                          : "text-teks"
                      }`}
                    >
                      {hari}
                    </span>

                    {/* Badge cuti per karyawan / Leave badge per employee */}
                    <div className="flex flex-col gap-0.5">
                      {cutiHariIni.slice(0, 3).map((c) => (
                        <span
                          key={c.id}
                          className={`truncate rounded px-1 py-0.5 text-[10px] font-semibold leading-tight ${WARNA_KARYAWAN[petaWarna[c.karyawanId]]}`}
                          title={`${c.nama} — ${c.status}`}
                        >
                          {c.nama}
                          {c.status === "menunggu" && " (?)"}
                        </span>
                      ))}
                      {cutiHariIni.length > 3 && (
                        <span className="text-[10px] font-semibold text-redup">
                          +{cutiHariIni.length - 3} lainnya
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Legenda status / Status legend */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-redup">
            <span className="font-semibold text-tinta">Keterangan:</span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-sedap" /> Hari ini
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-4 rounded bg-sedap/20 border-l-2 border-sedap" /> Cuti disetujui
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-xs">(?) </span> Menunggu persetujuan
            </span>
          </div>

          {/* Daftar pengajuan bulan ini / Leave requests list for this month */}
          {data.length === 0 ? (
            <div className="kartu p-5">
              <Kosong teks={`Tidak ada pengajuan cuti di bulan ${formatBulan(bulan)}.`} />
            </div>
          ) : (
            <section className="kartu overflow-hidden">
              <div className="border-b border-tinta/10 px-5 py-4">
                <h2 className="font-semibold text-tinta">Daftar Pengajuan Bulan Ini</h2>
                <p className="text-sm text-redup">{data.length} pengajuan ditemukan</p>
              </div>
              <div className="overflow-x-auto">
                <table className="tabel">
                  <thead>
                    <tr>
                      <th>Karyawan</th>
                      <th>Tanggal Mulai</th>
                      <th>Tanggal Selesai</th>
                      <th>Lama</th>
                      <th>Alasan</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((c) => {
                      const lama = Math.round((c.tanggalSelesai - c.tanggalMulai) / 86400000) + 1;
                      return (
                        <tr key={c.id} className="transition hover:bg-krem">
                          <td>
                            <span
                              className={`inline-block rounded px-2 py-0.5 text-xs font-bold ${WARNA_KARYAWAN[petaWarna[c.karyawanId]]}`}
                            >
                              {c.nama}
                            </span>
                          </td>
                          <td className="tabular-nums">
                            {c.tanggalMulai.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                          </td>
                          <td className="tabular-nums">
                            {c.tanggalSelesai.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                          </td>
                          <td className="font-bold tabular-nums">{lama} hari</td>
                          <td className="max-w-xs truncate text-redup" title={c.alasan}>
                            {c.alasan}
                          </td>
                          <td>
                            <PilStatus status={c.status} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
