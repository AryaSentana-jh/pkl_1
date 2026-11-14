"use client";

import Link from "next/link";
import { usePengguna } from "@/lib/pengguna";
import { useAmbilData } from "@/lib/useAmbilData";
import { ambilKuotaCuti } from "@/lib/data";
import { formatTanggal } from "@/lib/waktu";
import KepalaHalaman from "@/components/KepalaHalaman";
import Ikon from "@/components/Ikon";
import Memuat from "@/components/Memuat";
import Kosong from "@/components/Kosong";
import Gagal from "@/components/Gagal";
import PilStatus from "@/components/PilStatus";

export default function HalamanKuotaCuti() {
  const { pengguna } = usePengguna();
  const { status, data, cobaLagi } = useAmbilData(() => ambilKuotaCuti(pengguna.uid), [pengguna.uid]);

  return (
    <div className="space-y-8">
      <KepalaHalaman
        judul="Kuota Cuti"
        keterangan="Pantau hak cuti tahunan, penggunaan kuota, dan sisa jatah cuti Anda."
        warna="kunyit"
        ikon="kuota"
      >
        <Link href="/cuti/baru" className="tombol-utama">
          <Ikon nama="tambah" />
          Ajukan Cuti
        </Link>
        <Link href="/cuti/tukar" className="tombol-kedua">
          <Ikon nama="tukar" />
          Tukar Cuti
        </Link>
      </KepalaHalaman>

      {/* Penanda jelas sumber data kebijakan perusahaan (sesuai aturan PRD) */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-300 bg-amber-50/80 p-4 text-sm text-amber-900 shadow-tipis">
        <div className="flex items-center gap-3">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-200 text-amber-800">
            <Ikon nama="peringatan" className="h-5 w-5" />
          </span>
          <div>
            <p className="font-bold text-amber-950">Aturan Kuota Cuti Katering Sedap</p>
            <p className="text-xs text-amber-800">
              Hak cuti tahunan adalah 12 hari kerja per tahun kalender. Hanya cuti yang berstatus <strong>Disetujui</strong> yang memotong kuota.
            </p>
          </div>
        </div>
        <span className="inline-flex items-center rounded-full border border-amber-300 bg-panel px-3 py-1 text-xs font-bold text-amber-900 shadow-tipis">
          Data Kebijakan Standar (12 Hari)
        </span>
      </div>

      {status === "memuat" && (
        <div className="kartu p-8">
          <Memuat />
        </div>
      )}

      {status === "gagal" && (
        <div className="kartu p-8">
          <Gagal onCobaLagi={cobaLagi} />
        </div>
      )}

      {status === "berhasil" && data && (
        <>
          {/* Kartu Statistik Ringkas */}
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Kuota */}
            <div className="kartu p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-redup">Total Kuota Tahunan</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-tinta tabular-nums">{data.totalKuota}</span>
                <span className="text-sm font-semibold text-redup">hari</span>
              </div>
              <p className="mt-2 text-xs text-redup">Periode tahun berjalan</p>
            </div>

            {/* Cuti Digunakan */}
            <div className="kartu p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-redup">Cuti Digunakan</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-terong tabular-nums">{data.cutiDigunakan}</span>
                <span className="text-sm font-semibold text-redup">hari</span>
              </div>
              <p className="mt-2 text-xs text-redup">Telah disetujui HRD</p>
            </div>

            {/* Cuti Menunggu */}
            <div className="kartu p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-redup">Sedang Diajukan</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-amber-600 tabular-nums">{data.cutiMenunggu}</span>
                <span className="text-sm font-semibold text-redup">hari</span>
              </div>
              <p className="mt-2 text-xs text-redup">Belum mengurangi kuota</p>
            </div>

            {/* Sisa Kuota */}
            <div className="kartu border-sedap/20 bg-sedap/5 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-sedap">Sisa Kuota Tersedia</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-sedap tabular-nums">{data.sisaKuota}</span>
                <span className="text-sm font-semibold text-sedap/80">hari</span>
              </div>
              <p className="mt-2 text-xs font-medium text-sedap/90">Dapat diajukan saat ini</p>
            </div>
          </section>

          {/* Progress Bar Penggunaan Kuota Cuti */}
          <section className="kartu p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-tinta">Progres Penggunaan Kuota Cuti</h2>
                <p className="text-sm text-redup">
                  Telah menggunakan {data.cutiDigunakan} dari {data.totalKuota} hari kuota cuti tahunan Anda.
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-tinta tabular-nums">{data.persentase}%</span>
                <span className="ml-1 text-xs font-semibold text-redup">Terpakai</span>
              </div>
            </div>

            {/* Bar Progres Visual */}
            <div className="h-4 w-full overflow-hidden rounded-full bg-latar p-0.5 border border-tinta/10">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  data.persentase > 80
                    ? "bg-red-500"
                    : data.persentase > 50
                    ? "bg-kunyit"
                    : "bg-sedap"
                }`}
                style={{ width: `${Math.max(4, data.persentase)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-redup pt-1 font-semibold">
              <span>0 Hari (Mulai)</span>
              <span>{Math.round(data.totalKuota / 2)} Hari (50%)</span>
              <span>{data.totalKuota} Hari (Penuh)</span>
            </div>
          </section>

          {/* Riwayat Penggunaan & Dampak Kuota */}
          <section className="kartu overflow-hidden">
            <div className="border-b border-tinta/10 p-5">
              <h2 className="text-lg font-bold text-tinta">Riwayat Penggunaan Kuota Cuti</h2>
              <p className="text-sm text-redup">
                Daftar seluruh pengajuan cuti beserta kalkulasi pengurangan kuotanya.
              </p>
            </div>

            {data.riwayat.length === 0 ? (
              <div className="p-6">
                <Kosong teks="Belum ada catatan penggunaan kuota cuti.">
                  <Link href="/cuti/baru" className="tombol-utama">
                    <Ikon nama="tambah" />
                    Ajukan Cuti Baru
                  </Link>
                </Kosong>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="tabel">
                  <thead>
                    <tr>
                      <th>Nomor</th>
                      <th>Jadwal Cuti</th>
                      <th>Durasi</th>
                      <th>Alasan</th>
                      <th>Status Pengajuan</th>
                      <th className="text-right">Dampak Kuota</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.riwayat.map((c) => (
                      <tr key={c.id} className="transition hover:bg-krem">
                        <td>
                          <Link href={`/cuti/${c.id}`} className="font-bold text-sedap hover:underline">
                            {c.id}
                          </Link>
                        </td>
                        <td className="font-medium tabular-nums">
                          {formatTanggal(c.tanggalMulai)} – {formatTanggal(c.tanggalSelesai)}
                        </td>
                        <td className="font-bold tabular-nums">{c.lama} hari</td>
                        <td className="max-w-xs truncate text-redup" title={c.alasan}>
                          {c.alasan}
                        </td>
                        <td>
                          <PilStatus status={c.status} />
                        </td>
                        <td className="text-right tabular-nums">
                          {c.status === "disetujui" ? (
                            <span className="font-bold text-red-700 bg-red-50 border border-red-200 rounded-lg px-2 py-0.5">
                              -{c.penguranganKuota} hari
                            </span>
                          ) : c.status === "menunggu" ? (
                            <span className="font-semibold text-amber-700 text-xs italic">
                              0 hari (menunggu)
                            </span>
                          ) : (
                            <span className="text-redup text-xs italic">
                              0 hari (ditolak)
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
