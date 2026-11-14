"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePengguna } from "@/lib/pengguna";
import { useAmbilData } from "@/lib/useAmbilData";
import { ambilPengajuanCuti, ambilKuotaCuti } from "@/lib/data";
import { formatTanggal, lamaHari } from "@/lib/waktu";
import KepalaHalaman from "@/components/KepalaHalaman";
import Ikon from "@/components/Ikon";
import Memuat from "@/components/Memuat";
import Kosong from "@/components/Kosong";
import Gagal from "@/components/Gagal";
import PilStatus from "@/components/PilStatus";

export default function HalamanCuti() {
  const { pengguna } = usePengguna();
  const router = useRouter();
  const { status, data, cobaLagi } = useAmbilData(() => ambilPengajuanCuti(pengguna.uid), [pengguna.uid]);
  const [kuota, setKuota] = useState(null);

  useEffect(() => {
    if (pengguna?.uid) {
      ambilKuotaCuti(pengguna.uid).then(setKuota);
    }
  }, [pengguna?.uid, status]);

  const tombolAjukan = (
    <div className="flex flex-wrap gap-2">
      <Link href="/cuti/baru" className="tombol-utama">
        <Ikon nama="tambah" />
        Ajukan Cuti
      </Link>
      <Link href="/cuti/tukar" className="tombol-kedua">
        <Ikon nama="tukar" />
        Tukar Cuti
      </Link>
    </div>
  );

  return (
    <div className="space-y-8">
      <KepalaHalaman
        judul="Cuti Saya"
        keterangan="Klik salah satu pengajuan untuk melihat rincian dan catatan HRD."
        warna="kunyit"
        ikon="kalender"
      >
        {tombolAjukan}
      </KepalaHalaman>

      {/* Widget Ringkasan Kuota Cuti */}
      {kuota && (
        <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-tinta/10 bg-panel p-5 shadow-kartu">
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-kunyit/20 text-tinta">
              <Ikon nama="kuota" className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-redup">Status Kuota Cuti Tahunan</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-tinta tabular-nums">{kuota.sisaKuota}</span>
                <span className="text-sm font-semibold text-redup">hari tersisa</span>
                <span className="text-xs text-redup">({kuota.cutiDigunakan} dari {kuota.totalKuota} hari terpakai)</span>
              </div>
            </div>
          </div>
          <Link
            href="/cuti/kuota"
            className="flex items-center gap-2 rounded-xl bg-latar px-4 py-2 text-sm font-bold text-tinta transition hover:bg-kunyit/30"
          >
            Lihat Rincian Kuota
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>
        </section>
      )}

      <section className="kartu overflow-hidden">
        {status === "memuat" && <Memuat />}
        {status === "gagal" && (
          <div className="p-5">
            <Gagal onCobaLagi={cobaLagi} />
          </div>
        )}
        {status === "berhasil" && data.length === 0 && (
          <div className="p-5">
            <Kosong teks="Kamu belum pernah mengajukan cuti.">{tombolAjukan}</Kosong>
          </div>
        )}
        {status === "berhasil" && data.length > 0 && (
          <div className="overflow-x-auto">
            <table className="tabel">
              <thead>
                <tr>
                  <th>Nomor</th>
                  <th>Tanggal</th>
                  <th>Lama</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map((c) => (
                  <tr key={c.id} onClick={() => router.push(`/cuti/${c.id}`)} className="cursor-pointer transition hover:bg-krem">
                    <td>
                      <Link href={`/cuti/${c.id}`} className="font-bold text-sedap hover:underline">
                        {c.id}
                      </Link>
                    </td>
                    <td className="font-semibold tabular-nums">
                      {formatTanggal(c.tanggalMulai)} – {formatTanggal(c.tanggalSelesai)}
                    </td>
                    <td className="tabular-nums">{lamaHari(c.tanggalMulai, c.tanggalSelesai)} hari</td>
                    <td><PilStatus status={c.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
