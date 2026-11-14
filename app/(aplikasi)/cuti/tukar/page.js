"use client";

import { useState } from "react";
import Link from "next/link";
import { usePengguna } from "@/lib/pengguna";
import { useAmbilData } from "@/lib/useAmbilData";
import { ambilPermintaanTukarCuti, responTukarCutiKaryawan } from "@/lib/data";
import { formatTanggal } from "@/lib/waktu";
import KepalaHalaman from "@/components/KepalaHalaman";
import Ikon from "@/components/Ikon";
import Memuat from "@/components/Memuat";
import Kosong from "@/components/Kosong";
import Gagal from "@/components/Gagal";
import PilStatus from "@/components/PilStatus";

export default function HalamanTukarCuti() {
  const { pengguna } = usePengguna();
  const [tabAktif, setTabAktif] = useState("masuk"); // "masuk" | "saya" | "riwayat"
  const [pesan, setPesan] = useState("");
  const [catatanRespon, setCatatanRespon] = useState({});
  const [prosesId, setProsesId] = useState(null);

  const { status, data, cobaLagi } = useAmbilData(
    () => ambilPermintaanTukarCuti(pengguna.uid),
    [pengguna.uid]
  );

  async function tanganiRespon(id, setuju) {
    try {
      setProsesId(id);
      const catatan = catatanRespon[id] || "";
      await responTukarCutiKaryawan({
        id,
        karyawanId: pengguna.uid,
        setuju,
        catatan,
      });
      setPesan(
        setuju
          ? "Permintaan tukar cuti berhasil disetujui! Diteruskan kepada HRD untuk keputusan akhir."
          : "Permintaan tukar cuti telah ditolak."
      );
      cobaLagi();
    } catch (err) {
      setPesan(`Gagal: ${err.message}`);
    } finally {
      setProsesId(null);
    }
  }

  const tombolAjukan = (
    <div className="flex flex-wrap gap-2">
      <Link href="/cuti/tukar/baru" className="tombol-utama">
        <Ikon nama="tambah" />
        Ajukan Tukar Cuti
      </Link>
      <Link href="/cuti" className="tombol-kedua">
        <Ikon nama="daftar" />
        Daftar Cuti
      </Link>
    </div>
  );

  const jumlahMasuk = data?.permintaanMasuk.filter((t) => t.status === "menunggu_karyawan").length || 0;
  const jumlahSaya = data?.pengajuanSaya.length || 0;
  const jumlahRiwayat = data?.riwayat.length || 0;

  return (
    <div className="space-y-8">
      <KepalaHalaman
        judul="Tukar Cuti"
        keterangan="Saling bertukar jadwal cuti bersama rekan kerja dengan persetujuan bertingkat (Rekan & HRD)."
        warna="kunyit"
        ikon="tukar"
      >
        {tombolAjukan}
      </KepalaHalaman>

      {pesan && (
        <div className="flex items-center justify-between rounded-xl border border-tinta/10 bg-krem p-4 font-bold text-tinta shadow-tipis">
          <span>{pesan}</span>
          <button onClick={() => setPesan("")} className="text-redup hover:text-tinta">
            <Ikon nama="silang" className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Tab Navigasi */}
      <nav className="flex flex-wrap gap-2 border-b border-tinta/10 pb-2">
        <button
          onClick={() => setTabAktif("masuk")}
          className={`relative rounded-xl px-4 py-2.5 text-sm font-bold transition ${
            tabAktif === "masuk"
              ? "bg-kunyit text-tinta shadow-tipis"
              : "bg-panel text-redup hover:bg-latar hover:text-tinta"
          }`}
        >
          Permintaan Masuk
          {jumlahMasuk > 0 && (
            <span className="ml-2 rounded-full bg-red-600 px-2 py-0.5 text-xs text-white">
              {jumlahMasuk}
            </span>
          )}
        </button>

        <button
          onClick={() => setTabAktif("saya")}
          className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
            tabAktif === "saya"
              ? "bg-kunyit text-tinta shadow-tipis"
              : "bg-panel text-redup hover:bg-latar hover:text-tinta"
          }`}
        >
          Pengajuan Saya
          {jumlahSaya > 0 && (
            <span className="ml-2 rounded-full bg-tinta/15 px-2 py-0.5 text-xs text-tinta">
              {jumlahSaya}
            </span>
          )}
        </button>

        <button
          onClick={() => setTabAktif("riwayat")}
          className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
            tabAktif === "riwayat"
              ? "bg-kunyit text-tinta shadow-tipis"
              : "bg-panel text-redup hover:bg-latar hover:text-tinta"
          }`}
        >
          Riwayat Pertukaran
          {jumlahRiwayat > 0 && (
            <span className="ml-2 rounded-full bg-tinta/15 px-2 py-0.5 text-xs text-tinta">
              {jumlahRiwayat}
            </span>
          )}
        </button>
      </nav>

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
          {/* TAB 1: PERMINTAAN MASUK DARI REKAN */}
          {tabAktif === "masuk" && (
            <div className="space-y-4">
              {data.permintaanMasuk.length === 0 ? (
                <div className="kartu p-8">
                  <Kosong teks="Tidak ada permintaan tukar cuti masuk dari rekan kerja saat ini." />
                </div>
              ) : (
                data.permintaanMasuk.map((t) => (
                  <div key={t.id} className="kartu overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-tinta/10 bg-krem px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 place-items-center rounded-full bg-panel font-bold text-tinta border border-tinta/10">
                          {t.namaPemohon.charAt(0)}
                        </span>
                        <div>
                          <p className="font-bold text-tinta">
                            {t.namaPemohon} <span className="font-normal text-redup">mengajak Anda bertukar jadwal</span>
                          </p>
                          <p className="text-xs text-redup">ID Pengajuan: {t.id} · Diajukan {formatTanggal(t.diajukanPada)}</p>
                        </div>
                      </div>
                      <PilStatus status={t.status} />
                    </div>

                    <div className="p-5 space-y-5">
                      {/* Alasan dari Rekan */}
                      <div className="rounded-xl border border-tinta/10 bg-latar p-4 text-sm">
                        <p className="text-xs font-semibold uppercase tracking-wider text-redup">Alasan Pengajuan:</p>
                        <p className="mt-1 font-medium text-teks italic">&ldquo;{t.alasan}&rdquo;</p>
                      </div>

                      {/* Komparasi Jadwal yang Ingin Ditukar */}
                      <div className="grid gap-4 md:grid-cols-2">
                        {/* Jadwal Ditawarkan Pemohon */}
                        <div className="rounded-2xl border border-sedap/20 bg-sedap/5 p-4">
                          <p className="text-xs font-bold uppercase tracking-wide text-sedap">
                            Jadwal Ditawarkan ({t.namaPemohon}):
                          </p>
                          <div className="mt-2 space-y-1">
                            <p className="text-base font-extrabold text-tinta tabular-nums">
                              {formatTanggal(t.jadwalPemohon.tanggalMulai)} – {formatTanggal(t.jadwalPemohon.tanggalSelesai)}
                            </p>
                            <p className="text-xs font-semibold text-redup">
                              Durasi: {t.jadwalPemohon.lama} hari kerja
                            </p>
                            <p className="text-xs text-redup">Alasan cuti: {t.jadwalPemohon.alasan}</p>
                          </div>
                        </div>

                        {/* Jadwal Milik Anda yang Diminta */}
                        <div className="rounded-2xl border border-kunyit/40 bg-kunyit/10 p-4">
                          <p className="text-xs font-bold uppercase tracking-wide text-amber-900">
                            Jadwal Anda yang Diminta:
                          </p>
                          <div className="mt-2 space-y-1">
                            <p className="text-base font-extrabold text-tinta tabular-nums">
                              {formatTanggal(t.jadwalRekan.tanggalMulai)} – {formatTanggal(t.jadwalRekan.tanggalSelesai)}
                            </p>
                            <p className="text-xs font-semibold text-redup">
                              Durasi: {t.jadwalRekan.lama} hari kerja
                            </p>
                            <p className="text-xs text-redup">Alasan cuti: {t.jadwalRekan.alasan}</p>
                          </div>
                        </div>
                      </div>

                      {/* Bagian Respon Karyawan B */}
                      {t.status === "menunggu_karyawan" ? (
                        <div className="border-t border-tinta/10 pt-4 space-y-3">
                          <label htmlFor={`catatan-${t.id}`} className="label">
                            Catatan Respon Anda (Opsional):
                          </label>
                          <input
                            id={`catatan-${t.id}`}
                            type="text"
                            placeholder="Contoh: Disetujui, saya bisa ambil jadwal Desember..."
                            value={catatanRespon[t.id] || ""}
                            onChange={(e) =>
                              setCatatanRespon({ ...catatanRespon, [t.id]: e.target.value })
                            }
                            className="isian"
                          />
                          <div className="flex flex-wrap gap-3">
                            <button
                              type="button"
                              disabled={prosesId === t.id}
                              onClick={() => tanganiRespon(t.id, true)}
                              className="tombol-utama"
                            >
                              <Ikon nama="centang" />
                              Setujui Permintaan
                            </button>
                            <button
                              type="button"
                              disabled={prosesId === t.id}
                              onClick={() => tanganiRespon(t.id, false)}
                              className="tombol border border-red-300 bg-panel text-red-700 hover:bg-red-50"
                            >
                              <Ikon nama="silang" />
                              Tolak Permintaan
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3 text-xs font-semibold text-blue-900">
                          Permintaan telah Anda setujui. Sedang menunggu verifikasi akhir dari pihak HRD.
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: PENGAJUAN SAYA */}
          {tabAktif === "saya" && (
            <div className="space-y-4">
              {data.pengajuanSaya.length === 0 ? (
                <div className="kartu p-8">
                  <Kosong teks="Anda belum memiliki pengajuan tukar cuti yang sedang berjalan.">
                    <Link href="/cuti/tukar/baru" className="tombol-utama">
                      <Ikon nama="tambah" />
                      Ajukan Tukar Cuti Baru
                    </Link>
                  </Kosong>
                </div>
              ) : (
                data.pengajuanSaya.map((t) => (
                  <div key={t.id} className="kartu p-6 space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-tinta/10 pb-4">
                      <div>
                        <p className="text-lg font-bold text-tinta">
                          Tukar Jadwal dengan <span className="text-sedap">{t.namaRekan}</span>
                        </p>
                        <p className="text-xs text-redup">ID: {t.id} · Diajukan {formatTanggal(t.diajukanPada)}</p>
                      </div>
                      <PilStatus status={t.status} />
                    </div>

                    {/* Stepper Status Persetujuan */}
                    <div className="grid gap-3 sm:grid-cols-3 text-center text-xs font-bold">
                      <div className="rounded-xl border border-sedap bg-sedap/10 p-2.5 text-sedap">
                        1. Pengajuan Dibuat ✓
                      </div>
                      <div
                        className={`rounded-xl border p-2.5 ${
                          t.status === "menunggu_karyawan"
                            ? "border-amber-400 bg-amber-50 text-amber-900 animate-pulse"
                            : "border-sedap bg-sedap/10 text-sedap"
                        }`}
                      >
                        2. Persetujuan Rekan {t.status !== "menunggu_karyawan" && "✓"}
                      </div>
                      <div
                        className={`rounded-xl border p-2.5 ${
                          t.status === "menunggu_hrd"
                            ? "border-blue-400 bg-blue-50 text-blue-900 animate-pulse"
                            : t.status === "disetujui_hrd"
                            ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                            : "border-tinta/10 bg-latar text-redup"
                        }`}
                      >
                        3. Keputusan HRD
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-xl border border-tinta/10 bg-latar p-4 text-sm">
                        <p className="text-xs font-semibold text-redup uppercase">Jadwal Anda (Dilepas):</p>
                        <p className="mt-1 font-bold text-tinta tabular-nums">
                          {formatTanggal(t.jadwalPemohon.tanggalMulai)} – {formatTanggal(t.jadwalPemohon.tanggalSelesai)} ({t.jadwalPemohon.lama} hari)
                        </p>
                      </div>
                      <div className="rounded-xl border border-tinta/10 bg-latar p-4 text-sm">
                        <p className="text-xs font-semibold text-redup uppercase">Jadwal Rekan (Diminta):</p>
                        <p className="mt-1 font-bold text-tinta tabular-nums">
                          {formatTanggal(t.jadwalRekan.tanggalMulai)} – {formatTanggal(t.jadwalRekan.tanggalSelesai)} ({t.jadwalRekan.lama} hari)
                        </p>
                      </div>
                    </div>

                    {t.catatanRekan && (
                      <p className="text-xs text-redup">
                        <strong>Catatan Rekan:</strong> {t.catatanRekan}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: RIWAYAT SELESAI */}
          {tabAktif === "riwayat" && (
            <section className="kartu overflow-hidden">
              {data.riwayat.length === 0 ? (
                <div className="p-8">
                  <Kosong teks="Belum ada riwayat pertukaran cuti yang selesai atau ditolak." />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="tabel">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Pihak Terkait</th>
                        <th>Jadwal Ditukar</th>
                        <th>Status Akhir</th>
                        <th>Catatan Keputusan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.riwayat.map((t) => (
                        <tr key={t.id} className="transition hover:bg-krem">
                          <td className="font-bold text-tinta">{t.id}</td>
                          <td>
                            <div className="text-xs font-medium">
                              <span className="font-bold text-tinta">{t.namaPemohon}</span> ↔{" "}
                              <span className="font-bold text-tinta">{t.namaRekan}</span>
                            </div>
                          </td>
                          <td className="text-xs tabular-nums">
                            {formatTanggal(t.jadwalPemohon.tanggalMulai)} ↔ {formatTanggal(t.jadwalRekan.tanggalMulai)}
                          </td>
                          <td>
                            <PilStatus status={t.status} />
                          </td>
                          <td className="text-xs text-redup">
                            {t.catatanHrd || t.catatanRekan || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}
