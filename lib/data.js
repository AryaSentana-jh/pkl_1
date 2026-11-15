/**
 * Semua halaman mengambil data lewat fungsi di sini, bukan langsung dari Firestore.
 * Nanti diganti dengan query Firestore. Bentuk keluarannya sengaja sama, jadi halaman tidak perlu diubah.
 */
import { users, presensi, pengajuan_cuti, permintaan_tukar_cuti } from "./dataContoh";
import { keTanggal, terlambat, lamaHari, formatTanggal } from "./waktu";

// Jeda 350 ms meniru waktu tunggu jaringan supaya layar Memuat terlihat
const jeda = () => new Promise((selesai) => setTimeout(selesai, 350));

const namaKaryawan = (id) => users.find((u) => u.id === id)?.nama ?? "(tidak dikenal)";
const jabatanKaryawan = (id) => users.find((u) => u.id === id)?.jabatan ?? "";
const terbaruDulu = (a, b) => new Date(b.diajukanPada) - new Date(a.diajukanPada);

// Helper penyimpanan lokal peramban agar perubahan tetap tersimpan saat memuat ulang halaman
const KUNCI_CUTI = "portal_hris_cuti_v1";
const KUNCI_TUKAR = "portal_hris_tukar_cuti_v1";

function pulihkanDate(obj) {
  if (!obj) return obj;
  const salin = { ...obj };
  if (salin.tanggalMulai) salin.tanggalMulai = new Date(salin.tanggalMulai);
  if (salin.tanggalSelesai) salin.tanggalSelesai = new Date(salin.tanggalSelesai);
  if (salin.diajukanPada) salin.diajukanPada = new Date(salin.diajukanPada);
  if (salin.diresponRekanPada) salin.diresponRekanPada = new Date(salin.diresponRekanPada);
  if (salin.diputuskanHrdPada) salin.diputuskanHrdPada = new Date(salin.diputuskanHrdPada);
  return salin;
}

let memoriCuti = null;
let memoriTukar = null;

function dapatkanCuti() {
  if (typeof window !== "undefined") {
    try {
      const tersimpan = localStorage.getItem(KUNCI_CUTI);
      if (tersimpan) {
        const parsed = JSON.parse(tersimpan);
        memoriCuti = parsed.map(pulihkanDate);
        return memoriCuti;
      }
    } catch (e) {
      // Abaikan jika galat storage
    }
  }
  if (!memoriCuti) {
    memoriCuti = pengajuan_cuti.map((c) => ({ ...c }));
  }
  return memoriCuti;
}

function simpanCuti(daftar) {
  memoriCuti = daftar;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(KUNCI_CUTI, JSON.stringify(daftar));
    } catch (e) {}
  }
}

function dapatkanTukarCuti() {
  if (typeof window !== "undefined") {
    try {
      const tersimpan = localStorage.getItem(KUNCI_TUKAR);
      if (tersimpan) {
        const parsed = JSON.parse(tersimpan);
        memoriTukar = parsed.map(pulihkanDate);
        return memoriTukar;
      }
    } catch (e) {
      // Abaikan jika galat storage
    }
  }
  if (!memoriTukar) {
    memoriTukar = permintaan_tukar_cuti.map((t) => ({ ...t }));
  }
  return memoriTukar;
}

function simpanTukarCuti(daftar) {
  memoriTukar = daftar;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(KUNCI_TUKAR, JSON.stringify(daftar));
    } catch (e) {}
  }
}

// ==========================================
// 1. PRESENSI
// ==========================================

export async function ambilPresensi(karyawanId, bulan) {
  await jeda();
  return presensi
    .filter((p) => p.karyawanId === karyawanId && p.tanggal.startsWith(bulan))
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal));
}

export async function ambilPresensiTanggal(karyawanId, tanggal) {
  await jeda();
  return presensi.find((p) => p.karyawanId === karyawanId && p.tanggal === tanggal) ?? null;
}

// ==========================================
// 2. PENGAJUAN CUTI BIASA
// ==========================================

export async function ambilPengajuanCuti(karyawanId) {
  await jeda();
  return dapatkanCuti()
    .filter((c) => c.karyawanId === karyawanId)
    .sort(terbaruDulu);
}

export async function ambilSatuPengajuan(id) {
  await jeda();
  const c = dapatkanCuti().find((c) => c.id === id);
  return c ? { ...c, nama: namaKaryawan(c.karyawanId) } : null;
}

export async function ambilSemuaPengajuan(status) {
  await jeda();
  return dapatkanCuti()
    .filter((c) => !status || status === "semua" || c.status === status)
    .sort(terbaruDulu)
    .map((c) => ({ ...c, nama: namaKaryawan(c.karyawanId) }));
}

export async function simpanPengajuanCuti({ karyawanId, tanggalMulai, tanggalSelesai, alasan }) {
  await jeda();
  const daftar = dapatkanCuti();
  const idBaru = `C0${String(daftar.length + 1).padStart(2, "0")}`;
  const baru = {
    id: idBaru,
    karyawanId,
    tanggalMulai: new Date(tanggalMulai + "T00:00:00"),
    tanggalSelesai: new Date(tanggalSelesai + "T00:00:00"),
    alasan,
    status: "menunggu",
    catatanHrd: "",
    diajukanPada: new Date(),
  };
  simpanCuti([baru, ...daftar]);
  return baru;
}

/**
 * Membuka WhatsApp dengan pesan notifikasi pengajuan cuti ke HRD.
 * Memakai wa.me deep link supaya bisa dibuka di peramban maupun aplikasi WA.
 * Mengembalikan true jika berhasil membuka, false jika nomor HRD tidak tersedia.
 */
export function kirimWaHrd(pengajuan) {
  // Cari HRD (hanya 1 orang: Wulan)
  const hrd = users.find((u) => u.role === "hrd");
  if (!hrd || !hrd.noWa) return false;

  // Data karyawan yang mengajukan
  const karyawan = users.find((u) => u.id === pengajuan.karyawanId);
  const namaKary = karyawan?.nama ?? "(tidak dikenal)";
  const jabatan = karyawan?.jabatan ?? "";

  // Hitung durasi
  const mulai = pengajuan.tanggalMulai instanceof Date
    ? pengajuan.tanggalMulai
    : new Date(pengajuan.tanggalMulai + "T00:00:00");
  const selesai = pengajuan.tanggalSelesai instanceof Date
    ? pengajuan.tanggalSelesai
    : new Date(pengajuan.tanggalSelesai + "T00:00:00");
  const durasi = lamaHari(mulai, selesai);

  // URL halaman persetujuan cuti HRD
  const urlPersetujuan = `${typeof window !== "undefined" ? window.location.origin : ""}/admin/cuti?status=menunggu`;

  // Susun pesan sesuai format yang diminta
  const pesan =
    `*[Portal HRIS] Pengajuan Cuti Baru*\n` +
    `\n` +
    `Halo Bu ${hrd.nama} (HRD),\n` +
    `Ada pengajuan cuti baru yang membutuhkan persetujuan Anda:\n` +
    `\n` +
    ` *Nama* : ${namaKary}${jabatan ? ` (${jabatan})` : ""}\n` +
    ` *Tanggal* : ${formatTanggal(mulai)} s/d ${formatTanggal(selesai)}\n` +
    ` *Durasi* : ${durasi} Hari Kerja\n` +
    ` *Alasan* : ${pengajuan.alasan}\n` +
    `\n` +
    `Klik tautan berikut untuk memutuskan:\n` +
    urlPersetujuan;

  const url = `https://wa.me/${hrd.noWa}?text=${encodeURIComponent(pesan)}`;
  window.open(url, "_blank");
  return true;
}

/**
 * Membuka WhatsApp dengan pesan keputusan cuti (disetujui/ditolak) ke karyawan.
 * Dipanggil setelah HRD menekan tombol Setujui atau Tolak.
 */
export function kirimWaKeputusanCuti({ karyawanId, tanggalMulai, tanggalSelesai, status, catatanHrd }) {
  // Cari data karyawan yang mengajukan
  const karyawan = users.find((u) => u.id === karyawanId);
  if (!karyawan || !karyawan.noWa) return false;

  const mulai = tanggalMulai instanceof Date
    ? tanggalMulai
    : new Date(tanggalMulai + "T00:00:00");
  const selesai = tanggalSelesai instanceof Date
    ? tanggalSelesai
    : new Date(tanggalSelesai + "T00:00:00");

  const disetujui = status === "disetujui";
  const labelStatus = disetujui ? "DISETUJUI" : "DITOLAK";
  const catatan = catatanHrd?.trim() || "Tidak ada catatan tambahan.";

  // URL agar karyawan bisa melihat detail pengajuannya
  const urlDetail = `${typeof window !== "undefined" ? window.location.origin : ""}/cuti`;

  let pesan;
  if (disetujui) {
    pesan =
      `*[Portal Sedap] Pengajuan Cuti Disetujui*\n` +
      `\n` +
      `Halo ${karyawan.nama},\n` +
      `Pengajuan cuti Anda telah *${labelStatus}* oleh HRD.\n` +
      `\n` +
      ` *Periode* : ${formatTanggal(mulai)} - ${formatTanggal(selesai)}\n` +
      ` *Catatan* : "${catatan}"\n` +
      `\n` +
      `Selamat beristirahat!\n` +
      `\n` +
      `Lihat detail: ${urlDetail}`;
  } else {
    pesan =
      `*[Portal Sedap] Pengajuan Cuti Ditolak*\n` +
      `\n` +
      `Halo ${karyawan.nama},\n` +
      `Mohon maaf, pengajuan cuti Anda telah *${labelStatus}* oleh HRD.\n` +
      `\n` +
      ` *Periode* : ${formatTanggal(mulai)} - ${formatTanggal(selesai)}\n` +
      ` *Alasan Penolakan* : "${catatan}"\n` +
      `\n` +
      `Silakan ajukan ulang dengan tanggal lain atau hubungi HRD untuk informasi lebih lanjut.\n` +
      `\n` +
      `Lihat detail: ${urlDetail}`;
  }

  const url = `https://wa.me/${karyawan.noWa}?text=${encodeURIComponent(pesan)}`;
  window.open(url, "_blank");
  return true;
}

// ==========================================
// 3. KUOTA CUTI KARYAWAN
// ==========================================

/**
 * Mengambil informasi kuota cuti karyawan yang sedang login:
 * - Total Kuota tahunan standar (12 hari)
 * - Cuti yang sudah disetujui & digunakan (mengurangi kuota)
 * - Cuti yang masih berstatus pending/menunggu (TIDAK mengurangi kuota terpakai)
 * - Sisa kuota cuti
 * - Persentase penggunaan kuota
 * - Riwayat penggunaan dengan kalkulasi pengurangan kuota
 */
export async function ambilKuotaCuti(karyawanId) {
  await jeda();
  const semuaCuti = dapatkanCuti()
    .filter((c) => c.karyawanId === karyawanId)
    .sort(terbaruDulu);

  const totalKuota = 12; // Aturan standar perusahaan Sedap: 12 hari kerja/tahun
  let cutiDigunakan = 0;
  let cutiMenunggu = 0;

  const riwayat = semuaCuti.map((c) => {
    const lama = lamaHari(c.tanggalMulai, c.tanggalSelesai);
    let penguranganKuota = 0;
    if (c.status === "disetujui") {
      cutiDigunakan += lama;
      penguranganKuota = lama;
    } else if (c.status === "menunggu") {
      cutiMenunggu += lama;
    }
    return {
      ...c,
      lama,
      penguranganKuota,
    };
  });

  const sisaKuota = Math.max(0, totalKuota - cutiDigunakan);
  const persentase = totalKuota > 0 ? Math.min(100, Math.round((cutiDigunakan / totalKuota) * 100)) : 0;

  return {
    karyawanId,
    nama: namaKaryawan(karyawanId),
    totalKuota,
    cutiDigunakan,
    cutiMenunggu,
    sisaKuota,
    persentase,
    riwayat,
    isSimulasi: true, // Penanda bahwa angka kuota berbasis kebijakan standar 12 hari
  };
}

// ==========================================
// 4. KARYAWAN
// ==========================================

export async function ambilSemuaKaryawan() {
  await jeda();
  return [...users].sort((a, b) => a.nama.localeCompare(b.nama));
}

export async function ambilKaryawan(id) {
  await jeda();
  return users.find((u) => u.id === id) ?? null;
}

export async function ambilDaftarRekan(karyawanId) {
  await jeda();
  return users
    .filter((u) => u.id !== karyawanId)
    .sort((a, b) => a.nama.localeCompare(b.nama));
}

// ==========================================
// 5. FITUR TUKAR CUTI
// ==========================================

/**
 * Mengambil jadwal cuti berstatus "disetujui" milik karyawan yang belum terlewat dan
 * tidak sedang dikunci oleh permintaan tukar cuti lain yang masih aktif.
 */
export async function ambilJadwalCutiValid(karyawanId) {
  await jeda();
  const cutiAktif = dapatkanCuti().filter(
    (c) => c.karyawanId === karyawanId && c.status === "disetujui"
  );

  // Ambil ID cuti yang sedang terkunci dalam proses pertukaran
  const daftarTukar = dapatkanTukarCuti();
  const idTerkunci = new Set();
  for (const t of daftarTukar) {
    if (t.status === "menunggu_karyawan" || t.status === "menunggu_hrd") {
      if (t.pengajuanPemohonId) idTerkunci.add(t.pengajuanPemohonId);
      if (t.pengajuanRekanId) idTerkunci.add(t.pengajuanRekanId);
    }
  }

  return cutiAktif.map((c) => ({
    ...c,
    lama: lamaHari(c.tanggalMulai, c.tanggalSelesai),
    sedangDiproses: idTerkunci.has(c.id),
  }));
}

/**
 * Mengambil semua permintaan tukar cuti untuk Karyawan tertentu (Permintaan Masuk, Pengajuan Saya, Riwayat)
 */
export async function ambilPermintaanTukarCuti(karyawanId) {
  await jeda();
  const semua = dapatkanTukarCuti().map(perkayaDataTukar);

  const permintaanMasuk = semua.filter(
    (t) => t.rekanId === karyawanId && (t.status === "menunggu_karyawan" || t.status === "menunggu_hrd")
  );

  const pengajuanSaya = semua.filter(
    (t) => t.pemohonId === karyawanId && (t.status === "menunggu_karyawan" || t.status === "menunggu_hrd")
  );

  const riwayat = semua.filter(
    (t) =>
      (t.pemohonId === karyawanId || t.rekanId === karyawanId) &&
      (t.status === "disetujui_hrd" || t.status === "ditolak_karyawan" || t.status === "ditolak_hrd")
  );

  return {
    permintaanMasuk,
    pengajuanSaya,
    riwayat,
  };
}

/**
 * Mengambil seluruh permintaan tukar cuti untuk Dasbor & Persetujuan HRD
 */
export async function ambilSemuaPermintaanTukarCuti(filterStatus) {
  await jeda();
  let semua = dapatkanTukarCuti().map(perkayaDataTukar);
  if (filterStatus && filterStatus !== "semua") {
    semua = semua.filter((t) => t.status === filterStatus);
  }
  return semua.sort((a, b) => new Date(b.diajukanPada) - new Date(a.diajukanPada));
}

export async function ambilSatuPermintaanTukarCuti(id) {
  await jeda();
  const t = dapatkanTukarCuti().find((item) => item.id === id);
  return t ? perkayaDataTukar(t) : null;
}

// Helper memperkaya objek tukar cuti dengan detail nama dan jadwal lengkap
function perkayaDataTukar(t) {
  const semuaCuti = dapatkanCuti();
  const cutiA = semuaCuti.find((c) => c.id === t.pengajuanPemohonId);
  const cutiB = semuaCuti.find((c) => c.id === t.pengajuanRekanId);

  return {
    ...t,
    namaPemohon: namaKaryawan(t.pemohonId),
    namaRekan: namaKaryawan(t.rekanId),
    jadwalPemohon: cutiA
      ? {
          id: cutiA.id,
          tanggalMulai: cutiA.tanggalMulai,
          tanggalSelesai: cutiA.tanggalSelesai,
          alasan: cutiA.alasan,
          lama: lamaHari(cutiA.tanggalMulai, cutiA.tanggalSelesai),
        }
      : t.jadwalPemohon,
    jadwalRekan: cutiB
      ? {
          id: cutiB.id,
          tanggalMulai: cutiB.tanggalMulai,
          tanggalSelesai: cutiB.tanggalSelesai,
          alasan: cutiB.alasan,
          lama: lamaHari(cutiB.tanggalMulai, cutiB.tanggalSelesai),
        }
      : t.jadwalRekan,
  };
}

/**
 * Membuat permintaan tukar cuti baru oleh Karyawan A
 */
export async function buatPermintaanTukarCuti({
  pemohonId,
  rekanId,
  pengajuanPemohonId,
  pengajuanRekanId,
  alasan,
}) {
  await jeda();

  // Validasi 1: Karyawan A tidak bisa memilih dirinya sendiri
  if (pemohonId === rekanId) {
    throw new Error("Anda tidak dapat bertukar jadwal cuti dengan diri sendiri.");
  }

  const semuaCuti = dapatkanCuti();
  const cutiA = semuaCuti.find((c) => c.id === pengajuanPemohonId && c.karyawanId === pemohonId);
  const cutiB = semuaCuti.find((c) => c.id === pengajuanRekanId && c.karyawanId === rekanId);

  // Validasi 2: Kedua jadwal harus ada dan berstatus disetujui
  if (!cutiA || cutiA.status !== "disetujui") {
    throw new Error("Jadwal cuti Anda tidak valid atau belum disetujui HRD.");
  }
  if (!cutiB || cutiB.status !== "disetujui") {
    throw new Error("Jadwal cuti rekan tidak valid atau belum disetujui HRD.");
  }

  // Validasi 3: Mencegah jadwal yang sedang diproses dipakai dalam transaksi ganda
  const daftarTukar = dapatkanTukarCuti();
  for (const t of daftarTukar) {
    if (t.status === "menunggu_karyawan" || t.status === "menunggu_hrd") {
      if (t.pengajuanPemohonId === pengajuanPemohonId || t.pengajuanRekanId === pengajuanPemohonId) {
        throw new Error("Jadwal cuti Anda sedang dalam proses pertukaran lain yang belum selesai.");
      }
      if (t.pengajuanPemohonId === pengajuanRekanId || t.pengajuanRekanId === pengajuanRekanId) {
        throw new Error("Jadwal cuti rekan sedang dalam proses pertukaran lain yang belum selesai.");
      }
    }
  }

  const idBaru = `TC0${String(daftarTukar.length + 1).padStart(2, "0")}`;
  const baru = {
    id: idBaru,
    pemohonId,
    rekanId,
    pengajuanPemohonId,
    pengajuanRekanId,
    alasan: alasan || "Pertukaran jadwal kerja/cuti bersama.",
    catatanRekan: "",
    catatanHrd: "",
    status: "menunggu_karyawan",
    diajukanPada: new Date(),
    diresponRekanPada: null,
    diputuskanHrdPada: null,
    jadwalPemohon: {
      id: cutiA.id,
      tanggalMulai: cutiA.tanggalMulai,
      tanggalSelesai: cutiA.tanggalSelesai,
      alasan: cutiA.alasan,
      lama: lamaHari(cutiA.tanggalMulai, cutiA.tanggalSelesai),
    },
    jadwalRekan: {
      id: cutiB.id,
      tanggalMulai: cutiB.tanggalMulai,
      tanggalSelesai: cutiB.tanggalSelesai,
      alasan: cutiB.alasan,
      lama: lamaHari(cutiB.tanggalMulai, cutiB.tanggalSelesai),
    },
  };

  simpanTukarCuti([baru, ...daftarTukar]);
  return perkayaDataTukar(baru);
}

/**
 * Respon dari Karyawan B: Menyetujui atau Menolak permintaan
 */
export async function responTukarCutiKaryawan({ id, karyawanId, setuju, catatan }) {
  await jeda();
  const daftar = dapatkanTukarCuti();
  const indeks = daftar.findIndex((t) => t.id === id);
  if (indeks === -1) throw new Error("Permintaan tukar cuti tidak ditemukan.");

  const item = daftar[indeks];

  // Validasi: Hanya Karyawan B yang berhak merespon tahap pertama
  if (item.rekanId !== karyawanId) {
    throw new Error("Hanya rekan kerja yang dituju yang dapat memberikan persetujuan ini.");
  }
  if (item.status !== "menunggu_karyawan") {
    throw new Error("Permintaan ini sudah tidak dalam status menunggu persetujuan rekan.");
  }

  item.diresponRekanPada = new Date();
  item.catatanRekan = catatan || (setuju ? "Menyetujui jadwal pertukaran." : "Menolak jadwal pertukaran.");

  if (setuju) {
    // Diteruskan ke HRD
    item.status = "menunggu_hrd";
  } else {
    // Langsung berhenti
    item.status = "ditolak_karyawan";
  }

  daftar[indeks] = item;
  simpanTukarCuti([...daftar]);
  return perkayaDataTukar(item);
}

/**
 * Keputusan dari HRD: Menyetujui atau Menolak pertukaran
 * Jika disetujui: Jadwal kedua karyawan otomatis saling ditukar di database!
 */
export async function responTukarCutiHrd({ id, setuju, catatanHrd }) {
  await jeda();
  const daftar = dapatkanTukarCuti();
  const indeks = daftar.findIndex((t) => t.id === id);
  if (indeks === -1) throw new Error("Permintaan tukar cuti tidak ditemukan.");

  const item = daftar[indeks];
  if (item.status !== "menunggu_hrd") {
    throw new Error("Permintaan ini belum disetujui oleh rekan kerja atau sudah diputuskan.");
  }

  item.diputuskanHrdPada = new Date();
  item.catatanHrd = catatanHrd || (setuju ? "Disetujui oleh HRD." : "Ditolak oleh HRD.");

  if (setuju) {
    item.status = "disetujui_hrd";

    // PROSES PERTUKARAN JADWAL OTOMATIS:
    // Tukar tanggalMulai dan tanggalSelesai antara pengajuanPemohon dan pengajuanRekan
    const semuaCuti = dapatkanCuti();
    const cA = semuaCuti.find((c) => c.id === item.pengajuanPemohonId);
    const cB = semuaCuti.find((c) => c.id === item.pengajuanRekanId);

    if (cA && cB) {
      const tempMulai = new Date(cA.tanggalMulai);
      const tempSelesai = new Date(cA.tanggalSelesai);

      cA.tanggalMulai = new Date(cB.tanggalMulai);
      cA.tanggalSelesai = new Date(cB.tanggalSelesai);
      cA.catatanHrd = (cA.catatanHrd ? cA.catatanHrd + " · " : "") + `Jadwal hasil tukar cuti #${item.id} dengan ${cB.karyawanId}`;

      cB.tanggalMulai = tempMulai;
      cB.tanggalSelesai = tempSelesai;
      cB.catatanHrd = (cB.catatanHrd ? cB.catatanHrd + " · " : "") + `Jadwal hasil tukar cuti #${item.id} dengan ${cA.karyawanId}`;

      simpanCuti([...semuaCuti]);
    }
  } else {
    item.status = "ditolak_hrd";
  }

  daftar[indeks] = item;
  simpanTukarCuti([...daftar]);
  return perkayaDataTukar(item);
}

// ==========================================
// 6. DASBOR & LAPORAN HRD
// ==========================================

export async function ambilRingkasanDasbor(tanggal) {
  await jeda();
  const hariIni = presensi.filter((p) => p.tanggal === tanggal);
  const daftarCuti = dapatkanCuti();
  const daftarTukar = dapatkanTukarCuti();

  return {
    hadir: hariIni.length,
    terlambat: hariIni.filter((p) => terlambat(p.jamMasuk)).length,
    cutiMenunggu: daftarCuti.filter((c) => c.status === "menunggu").length,
    tukarCutiMenunggu: daftarTukar.filter((t) => t.status === "menunggu_hrd").length,
    jumlahKaryawan: users.length,
  };
}

export async function ambilRekapBulanan(bulan) {
  await jeda();
  const daftarCuti = dapatkanCuti();

  return [...users]
    .sort((a, b) => a.nama.localeCompare(b.nama))
    .map((u) => {
      const hadir = presensi.filter((p) => p.karyawanId === u.id && p.tanggal.startsWith(bulan));
      let cutiDisetujui = 0;
      for (const c of daftarCuti) {
        if (c.karyawanId !== u.id || c.status !== "disetujui") continue;
        for (let d = new Date(c.tanggalMulai); d <= c.tanggalSelesai; d.setDate(d.getDate() + 1)) {
          if (keTanggal(d).startsWith(bulan)) cutiDisetujui++;
        }
      }
      return {
        karyawanId: u.id,
        nama: u.nama,
        hariHadir: hadir.length,
        terlambat: hadir.filter((p) => terlambat(p.jamMasuk)).length,
        cutiDisetujui,
      };
    });
}

export async function ambilJadwalCutiTim(bulan) {
  await jeda();
  const awal = new Date(`${bulan}-01T00:00:00`);
  const akhir = new Date(awal.getFullYear(), awal.getMonth() + 1, 0, 23, 59, 59);
  return dapatkanCuti()
    .filter((c) => c.tanggalMulai <= akhir && c.tanggalSelesai >= awal)
    .map((c) => ({ ...c, nama: namaKaryawan(c.karyawanId) }))
    .sort((a, b) => new Date(a.tanggalMulai) - new Date(b.tanggalMulai));
}
