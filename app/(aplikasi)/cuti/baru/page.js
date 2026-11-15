"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePengguna } from "@/lib/pengguna";
import { ambilKuotaCuti, simpanPengajuanCuti, kirimWaHrd } from "@/lib/data";
import { lamaHari } from "@/lib/waktu";
import KepalaHalaman from "@/components/KepalaHalaman";
import Ikon from "@/components/Ikon";

const kosong = { tanggalMulai: "", tanggalSelesai: "", alasan: "" };

export default function HalamanAjukanCuti() {
  const router = useRouter();
  const { pengguna } = usePengguna();
  const [isian, setIsian] = useState(kosong);
  const [galat, setGalat] = useState({});
  const [tersimpan, setTersimpan] = useState(false);
  const [kuota, setKuota] = useState(null);

  // Ambil data kuota cuti karyawan yang login
  useEffect(() => {
    if (pengguna?.uid) {
      ambilKuotaCuti(pengguna.uid).then(setKuota);
    }
  }, [pengguna?.uid]);

  const ubah = (e) => setIsian({ ...isian, [e.target.name]: e.target.value });

  // Hitung durasi hari secara realtime
  let durasiHari = 0;
  if (isian.tanggalMulai && isian.tanggalSelesai && isian.tanggalSelesai >= isian.tanggalMulai) {
    durasiHari = lamaHari(new Date(isian.tanggalMulai + "T00:00:00"), new Date(isian.tanggalSelesai + "T00:00:00"));
  }

  const kuotaKurang = kuota && durasiHari > kuota.sisaKuota;

  async function kirim(e) {
    e.preventDefault();
    const g = {};
    if (!isian.tanggalMulai) g.tanggalMulai = "Tanggal mulai wajib diisi.";
    if (!isian.tanggalSelesai) g.tanggalSelesai = "Tanggal selesai wajib diisi.";
    else if (isian.tanggalMulai && isian.tanggalSelesai < isian.tanggalMulai)
      g.tanggalSelesai = "Tanggal selesai harus sama atau setelah tanggal mulai";
    if (!isian.alasan.trim()) g.alasan = "Alasan wajib diisi.";

    if (kuotaKurang) {
      g.kuota = `Durasi cuti (${durasiHari} hari) melebihi sisa kuota yang tersedia (${kuota.sisaKuota} hari).`;
    }

    setGalat(g);
    if (Object.keys(g).length > 0) return;

    try {
      setTersimpan(true);
      const hasil = await simpanPengajuanCuti({
        karyawanId: pengguna.uid,
        tanggalMulai: isian.tanggalMulai,
        tanggalSelesai: isian.tanggalSelesai,
        alasan: isian.alasan,
      });

      // Kirim notifikasi WhatsApp ke HRD
      kirimWaHrd(hasil);

      setTimeout(() => {
        setIsian(kosong);
        setTersimpan(false);
        router.push("/cuti");
      }, 1200);
    } catch (err) {
      setGalat({ umum: err.message });
      setTersimpan(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      <KepalaHalaman
        judul="Ajukan Cuti"
        keterangan="Isi tanggal dan alasan. HRD memutuskan pengajuanmu di halaman Persetujuan Cuti."
        warna="kunyit"
        ikon="tambah"
      >
        <Link href="/cuti" className="tombol-kedua">
          <Ikon nama="kembali" />
          Daftar Cuti
        </Link>
        <Link href="/cuti/kuota" className="tombol-kedua">
          <Ikon nama="kuota" />
          Cek Kuota Cuti
        </Link>
      </KepalaHalaman>

      {/* Info Kuota Saat Ini */}
      {kuota && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-tinta/10 bg-panel p-4 shadow-tipis">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-kunyit/20 text-tinta">
              <Ikon nama="kuota" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-redup">Sisa Kuota Cuti Anda</p>
              <p className="text-xl font-extrabold text-tinta tabular-nums">
                {kuota.sisaKuota} <span className="text-sm font-semibold text-redup">/ {kuota.totalKuota} hari</span>
              </p>
            </div>
          </div>
          {durasiHari > 0 && (
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-wide text-redup">Durasi Pengajuan</p>
              <p className="text-lg font-bold text-sedap tabular-nums">{durasiHari} hari kerja</p>
            </div>
          )}
        </div>
      )}

      {/* Peringatan jika durasi melebihi sisa kuota */}
      {kuotaKurang && (
        <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-900 shadow-tipis">
          <div className="flex items-start gap-3">
            <span className="grid h-6 w-6 shrink-0 place-items-center text-red-600">
              <Ikon nama="peringatan" />
            </span>
            <div>
              <p className="font-bold text-red-950">Peringatan: Kuota Cuti Tidak Mencukupi</p>
              <p className="mt-0.5 text-xs text-red-800">
                Anda mengajukan cuti selama <strong>{durasiHari} hari</strong>, namun sisa kuota cuti tahunan Anda hanya <strong>{kuota?.sisaKuota} hari</strong>. Mohon sesuaikan tanggal atau konsultasikan dengan HRD.
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={kirim} noValidate className="kartu space-y-5 p-6">
        {galat.umum && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
            {galat.umum}
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="tanggalMulai" className="label">Tanggal mulai</label>
            <input
              id="tanggalMulai"
              name="tanggalMulai"
              type="date"
              value={isian.tanggalMulai}
              onChange={ubah}
              className="isian tabular-nums"
            />
            {galat.tanggalMulai && <p className="galat">{galat.tanggalMulai}</p>}
          </div>
          <div>
            <label htmlFor="tanggalSelesai" className="label">Tanggal selesai</label>
            <input
              id="tanggalSelesai"
              name="tanggalSelesai"
              type="date"
              value={isian.tanggalSelesai}
              onChange={ubah}
              className="isian tabular-nums"
            />
            {galat.tanggalSelesai && <p className="galat">{galat.tanggalSelesai}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="alasan" className="label">Alasan</label>
          <textarea
            id="alasan"
            name="alasan"
            rows={4}
            value={isian.alasan}
            onChange={ubah}
            placeholder="Contoh: Menghadiri pernikahan saudara di luar kota..."
            className="isian"
          />
          {galat.alasan && <p className="galat">{galat.alasan}</p>}
        </div>

        <button
          type="submit"
          disabled={tersimpan || kuotaKurang}
          className="tombol-utama px-8 py-3 text-lg disabled:cursor-not-allowed disabled:opacity-40"
        >
          Kirim Pengajuan
        </button>

        {tersimpan && (
          <p role="status" className="rounded-xl border border-disetujui bg-disetujui/15 p-3 font-bold text-tinta">
            Pengajuan berhasil dikirim! Mengarahkan ke Daftar Cuti...
          </p>
        )}
      </form>
    </div>
  );
}
