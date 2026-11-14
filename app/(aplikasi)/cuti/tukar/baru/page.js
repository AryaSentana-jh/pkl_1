"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePengguna } from "@/lib/pengguna";
import { ambilDaftarRekan, ambilJadwalCutiValid, buatPermintaanTukarCuti } from "@/lib/data";
import { formatTanggal } from "@/lib/waktu";
import KepalaHalaman from "@/components/KepalaHalaman";
import Ikon from "@/components/Ikon";
import Memuat from "@/components/Memuat";

export default function HalamanFormTukarCuti() {
  const router = useRouter();
  const { pengguna } = usePengguna();

  const [rekanList, setRekanList] = useState([]);
  const [jadwalSaya, setJadwalSaya] = useState([]);
  const [jadwalRekan, setJadwalRekan] = useState([]);

  const [rekanId, setRekanId] = useState("");
  const [cutiSayaId, setCutiSayaId] = useState("");
  const [cutiRekanId, setCutiRekanId] = useState("");
  const [alasan, setAlasan] = useState("");

  const [memuatData, setMemuatData] = useState(true);
  const [memuatJadwalRekan, setMemuatJadwalRekan] = useState(false);
  const [galat, setGalat] = useState("");
  const [berhasil, setBerhasil] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Ambil data awal: daftar rekan dan jadwal cuti valid milik login user
  useEffect(() => {
    if (!pengguna?.uid) return;
    async function muat() {
      try {
        setMemuatData(true);
        const [rekan, jadwal] = await Promise.all([
          ambilDaftarRekan(pengguna.uid),
          ambilJadwalCutiValid(pengguna.uid),
        ]);
        setRekanList(rekan);
        setJadwalSaya(jadwal);
      } catch (err) {
        setGalat(err.message);
      } finally {
        setMemuatData(false);
      }
    }
    muat();
  }, [pengguna?.uid]);

  // Saat Karyawan B dipilih lewat event handler
  async function gantiRekan(id) {
    setRekanId(id);
    setCutiRekanId("");
    if (!id) {
      setJadwalRekan([]);
      return;
    }
    try {
      setMemuatJadwalRekan(true);
      const jadwal = await ambilJadwalCutiValid(id);
      setJadwalRekan(jadwal);
    } catch (err) {
      setGalat(err.message);
    } finally {
      setMemuatJadwalRekan(false);
    }
  }

  const rekanTerpilih = rekanList.find((r) => r.id === rekanId);
  const itemCutiSaya = jadwalSaya.find((c) => c.id === cutiSayaId);
  const itemCutiRekan = jadwalRekan.find((c) => c.id === cutiRekanId);

  async function kirim(e) {
    e.preventDefault();
    setGalat("");

    if (!rekanId) {
      setGalat("Silakan pilih rekan kerja yang ingin diajak bertukar.");
      return;
    }
    if (!cutiSayaId) {
      setGalat("Silakan pilih salah satu jadwal cuti milik Anda untuk ditukarkan.");
      return;
    }
    if (!cutiRekanId) {
      setGalat("Silakan pilih jadwal cuti rekan yang ingin Anda minta.");
      return;
    }
    if (!alasan.trim()) {
      setGalat("Silakan isi alasan pertukaran jadwal.");
      return;
    }

    try {
      setSubmitting(true);
      await buatPermintaanTukarCuti({
        pemohonId: pengguna.uid,
        rekanId,
        pengajuanPemohonId: cutiSayaId,
        pengajuanRekanId: cutiRekanId,
        alasan,
      });

      setBerhasil(true);
      setTimeout(() => {
        router.push("/cuti/tukar");
      }, 1500);
    } catch (err) {
      setGalat(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-8">
      <KepalaHalaman
        judul="Ajukan Tukar Cuti"
        keterangan="Pilih rekan kerja dan jadwal cuti yang ingin saling ditukarkan."
        warna="kunyit"
        ikon="tukar"
      >
        <Link href="/cuti/tukar" className="tombol-kedua">
          <Ikon nama="kembali" />
          Kembali
        </Link>
      </KepalaHalaman>

      {memuatData ? (
        <div className="kartu p-8">
          <Memuat />
        </div>
      ) : (
        <form onSubmit={kirim} className="space-y-6">
          {galat && (
            <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-sm font-semibold text-red-900 shadow-tipis">
              ⚠️ {galat}
            </div>
          )}

          {berhasil && (
            <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 font-bold text-emerald-900 shadow-tipis">
              ✓ Permintaan tukar cuti berhasil dibuat! Mengarahkan ke halaman Tukar Cuti...
            </div>
          )}

          {/* 1. Pilih Rekan Kerja */}
          <div className="kartu p-6 space-y-4">
            <h2 className="text-base font-bold text-tinta flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-kunyit text-xs text-tinta font-black">1</span>
              Pilih Rekan Kerja (Karyawan B)
            </h2>
            <div>
              <label htmlFor="rekan" className="label">Nama Rekan Kerja</label>
              <select
                id="rekan"
                value={rekanId}
                onChange={(e) => gantiRekan(e.target.value)}
                className="isian cursor-pointer"
              >
                <option value="">-- Pilih Rekan Kerja --</option>
                {rekanList.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nama} ({r.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 2. Pilih Jadwal Cuti Milik Sendiri */}
          <div className="kartu p-6 space-y-4">
            <h2 className="text-base font-bold text-tinta flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-kunyit text-xs text-tinta font-black">2</span>
              Pilih Jadwal Cuti Anda yang Ingin Ditukar
            </h2>
            {jadwalSaya.length === 0 ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs font-semibold text-amber-900">
                Anda belum memiliki jadwal cuti berstatus <strong>Disetujui</strong> yang dapat ditukarkan. Silakan ajukan cuti terlebih dahulu.
              </div>
            ) : (
              <div className="space-y-2">
                {jadwalSaya.map((c) => (
                  <label
                    key={c.id}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition ${
                      c.sedangDiproses
                        ? "border-tinta/10 bg-latar/80 opacity-60 cursor-not-allowed"
                        : cutiSayaId === c.id
                        ? "border-sedap bg-sedap/5 ring-2 ring-sedap"
                        : "border-tinta/15 bg-panel hover:border-tinta/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="cutiSaya"
                        value={c.id}
                        disabled={c.sedangDiproses}
                        checked={cutiSayaId === c.id}
                        onChange={(e) => setCutiSayaId(e.target.value)}
                        className="text-sedap focus:ring-sedap"
                      />
                      <div>
                        <p className="font-bold text-tinta tabular-nums">
                          {formatTanggal(c.tanggalMulai)} – {formatTanggal(c.tanggalSelesai)}
                        </p>
                        <p className="text-xs text-redup">
                          ID: {c.id} · Alasan: {c.alasan}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-lg bg-latar px-2.5 py-1 text-xs font-bold text-tinta tabular-nums">
                      {c.lama} hari {c.sedangDiproses && "(Sedang diproses)"}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* 3. Pilih Jadwal Cuti Rekan */}
          {rekanId && (
            <div className="kartu p-6 space-y-4">
              <h2 className="text-base font-bold text-tinta flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-kunyit text-xs text-tinta font-black">3</span>
                Pilih Jadwal Cuti Milik {rekanTerpilih?.nama} yang Diinginkan
              </h2>
              {memuatJadwalRekan ? (
                <Memuat />
              ) : jadwalRekan.length === 0 ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs font-semibold text-amber-900">
                  {rekanTerpilih?.nama} belum memiliki jadwal cuti berstatus <strong>Disetujui</strong> yang dapat ditukar saat ini.
                </div>
              ) : (
                <div className="space-y-2">
                  {jadwalRekan.map((c) => (
                    <label
                      key={c.id}
                      className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition ${
                        c.sedangDiproses
                          ? "border-tinta/10 bg-latar/80 opacity-60 cursor-not-allowed"
                          : cutiRekanId === c.id
                          ? "border-sedap bg-sedap/5 ring-2 ring-sedap"
                          : "border-tinta/15 bg-panel hover:border-tinta/40"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="cutiRekan"
                          value={c.id}
                          disabled={c.sedangDiproses}
                          checked={cutiRekanId === c.id}
                          onChange={(e) => setCutiRekanId(e.target.value)}
                          className="text-sedap focus:ring-sedap"
                        />
                        <div>
                          <p className="font-bold text-tinta tabular-nums">
                            {formatTanggal(c.tanggalMulai)} – {formatTanggal(c.tanggalSelesai)}
                          </p>
                          <p className="text-xs text-redup">
                            ID: {c.id} · Alasan: {c.alasan}
                          </p>
                        </div>
                      </div>
                      <span className="rounded-lg bg-latar px-2.5 py-1 text-xs font-bold text-tinta tabular-nums">
                        {c.lama} hari {c.sedangDiproses && "(Sedang diproses)"}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. Alasan / Catatan */}
          <div className="kartu p-6 space-y-4">
            <h2 className="text-base font-bold text-tinta flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-kunyit text-xs text-tinta font-black">4</span>
              Alasan Pertukaran Jadwal
            </h2>
            <div>
              <label htmlFor="alasan" className="label">Alasan Pertukaran *</label>
              <textarea
                id="alasan"
                rows={3}
                value={alasan}
                onChange={(e) => setAlasan(e.target.value)}
                placeholder="Jelaskan kebutuhan pertukaran jadwal agar rekan dan HRD dapat mempertimbangkannya..."
                className="isian"
              />
            </div>
          </div>

          {/* 5. Ringkasan Jadwal Sebelum Dikirim */}
          {itemCutiSaya && itemCutiRekan && (
            <div className="kartu border-sedap/30 bg-latar/50 p-6 space-y-4 shadow-kartu">
              <div className="flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-sedap text-xs text-white font-black">5</span>
                <h3 className="font-bold text-tinta">Ringkasan Pratinjau Pertukaran Jadwal</h3>
              </div>
              <p className="text-xs text-redup">
                Jika disetujui oleh kedua pihak dan HRD, jadwal akan diperbarui secara otomatis:
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-sedap/20 bg-panel p-4">
                  <p className="text-xs font-bold text-sedap uppercase">Jadwal Baru Anda (Setelah Tukar):</p>
                  <p className="mt-1 text-base font-black text-tinta tabular-nums">
                    {formatTanggal(itemCutiRekan.tanggalMulai)} – {formatTanggal(itemCutiRekan.tanggalSelesai)}
                  </p>
                  <p className="text-xs text-redup font-semibold">({itemCutiRekan.lama} hari kerja)</p>
                </div>

                <div className="rounded-xl border border-sedap/20 bg-panel p-4">
                  <p className="text-xs font-bold text-sedap uppercase">Jadwal Baru {rekanTerpilih?.nama}:</p>
                  <p className="mt-1 text-base font-black text-tinta tabular-nums">
                    {formatTanggal(itemCutiSaya.tanggalMulai)} – {formatTanggal(itemCutiSaya.tanggalSelesai)}
                  </p>
                  <p className="text-xs text-redup font-semibold">({itemCutiSaya.lama} hari kerja)</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={submitting || berhasil || !itemCutiSaya || !itemCutiRekan}
              className="tombol-utama px-8 py-3 text-lg disabled:cursor-not-allowed disabled:opacity-40"
            >
              Kirim Permintaan Tukar Cuti
            </button>
            <Link href="/cuti/tukar" className="tombol-kedua">
              Batal
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
