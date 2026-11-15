/**
 * Data contoh pengganti Firestore. Nama koleksi dan field mengikuti PRD 7.1,
 * kecuali koleksi profil yang bernama users. Field timestamp ditulis sebagai Date.
 * Field noWa ditambahkan untuk fitur tombol WhatsApp HRD (opsional, boleh kosong).
 */
import { keTanggal } from "./waktu";

// id = ID dokumen = uid akun Firebase Authentication
// Hanya 1 HRD yaitu Wulan, 7 karyawan lainnya berperan "karyawan"
export const users = [
  { id: "dina",  nama: "Dina",  email: "dina@sedap.id",  role: "karyawan", jabatan: "Staf Dapur",      noWa: "6281246513633" },
  { id: "nisa",  nama: "Nisa",  email: "nisa@sedap.id",  role: "karyawan", jabatan: "Staf Pelayanan",   noWa: "6281246513633" },
  { id: "wulan", nama: "Wulan", email: "wulan@sedap.id", role: "hrd",      jabatan: "HRD",              noWa: "6281246513633" },
  { id: "rama",  nama: "Rama",  email: "rama@sedap.id",  role: "karyawan", jabatan: "Staf Dapur",       noWa: "6281246513633" },
  { id: "sari",  nama: "Sari",  email: "sari@sedap.id",  role: "karyawan", jabatan: "Staf Administrasi", noWa: "" },
  { id: "budi",  nama: "Budi",  email: "budi@sedap.id",  role: "karyawan", jabatan: "Staf Gudang",      noWa: "6281246513633" },
  { id: "ayu",   nama: "Ayu",   email: "ayu@sedap.id",   role: "karyawan", jabatan: "Staf Pelayanan",   noWa: "6281246513633" },
  { id: "joko",  nama: "Joko",  email: "joko@sedap.id",  role: "karyawan", jabatan: "Staf Dapur",       noWa: "" },
];

// Hari datang setelah 08.00
const masukTerlambat = {
  "2026-09-03": "08:14",
  "2026-09-15": "08:05",
  "2026-09-29": "08:22",
  "2026-10-06": "08:09",
};

const hariCuti = ["2026-09-24", "2026-09-25"];

function buatPresensiKaryawan(uid) {
  const hasil = [];
  for (let d = new Date("2026-09-01T00:00:00"); d <= new Date("2026-10-08T00:00:00"); d.setDate(d.getDate() + 1)) {
    const hari = d.getDay();
    if (hari === 0 || hari === 6) continue;

    const tanggal = keTanggal(d);
    if (uid === "dina" && hariCuti.includes(tanggal)) continue;

    const jam = masukTerlambat[tanggal] ?? `07:${40 + (d.getDate() % 15)}`;
    hasil.push({
      id: `${uid}-${tanggal}`,
      karyawanId: uid,
      tanggal,
      jamMasuk: new Date(`${tanggal}T${jam}:00`),
      jamPulang: tanggal === "2026-10-08" ? null : new Date(`${tanggal}T17:0${d.getDate() % 10}:00`),
    });
  }
  return hasil;
}

export const presensi = [
  ...buatPresensiKaryawan("dina"),
  ...buatPresensiKaryawan("wulan"),
];

// Data contoh pengajuan cuti awal
export const pengajuan_cuti = [
  {
    id: "C001",
    karyawanId: "dina",
    tanggalMulai: new Date("2026-09-24T00:00:00"),
    tanggalSelesai: new Date("2026-09-25T00:00:00"),
    alasan: "Menghadiri pernikahan saudara di Bandung",
    status: "disetujui",
    catatanHrd: "Disetujui. Selamat untuk keluarga.",
    diajukanPada: new Date("2026-09-10T09:15:00"),
  },
  {
    id: "C002",
    karyawanId: "dina",
    tanggalMulai: new Date("2026-10-01T00:00:00"),
    tanggalSelesai: new Date("2026-10-02T00:00:00"),
    alasan: "Urusan keluarga",
    status: "ditolak",
    catatanHrd: "Bertepatan dengan pesanan katering besar. Mohon ajukan tanggal lain.",
    diajukanPada: new Date("2026-09-21T13:40:00"),
  },
  {
    id: "C003",
    karyawanId: "dina",
    tanggalMulai: new Date("2026-10-19T00:00:00"),
    tanggalSelesai: new Date("2026-10-21T00:00:00"),
    alasan: "Liburan bersama keluarga",
    status: "menunggu",
    catatanHrd: "",
    diajukanPada: new Date("2026-10-05T08:30:00"),
  },
  {
    id: "C004",
    karyawanId: "nisa",
    tanggalMulai: new Date("2026-09-14T00:00:00"),
    tanggalSelesai: new Date("2026-09-14T00:00:00"),
    alasan: "Kontrol kesehatan ke dokter",
    status: "disetujui",
    catatanHrd: "Semoga lekas sehat.",
    diajukanPada: new Date("2026-09-08T10:05:00"),
  },
  {
    id: "C005",
    karyawanId: "nisa",
    tanggalMulai: new Date("2026-10-12T00:00:00"),
    tanggalSelesai: new Date("2026-10-13T00:00:00"),
    alasan: "Mengurus pindah rumah",
    status: "menunggu",
    catatanHrd: "",
    diajukanPada: new Date("2026-10-02T16:20:00"),
  },
  {
    id: "C006",
    karyawanId: "nisa",
    tanggalMulai: new Date("2026-10-26T00:00:00"),
    tanggalSelesai: new Date("2026-10-26T00:00:00"),
    alasan: "Menghadiri wisuda adik",
    status: "menunggu",
    catatanHrd: "",
    diajukanPada: new Date("2026-10-07T11:00:00"),
  },
  {
    id: "C007",
    karyawanId: "dina",
    tanggalMulai: new Date("2026-11-20T00:00:00"),
    tanggalSelesai: new Date("2026-11-21T00:00:00"),
    alasan: "Acara keluarga di Solo",
    status: "disetujui",
    catatanHrd: "Disetujui.",
    diajukanPada: new Date("2026-10-20T10:00:00"),
  },
  {
    id: "C008",
    karyawanId: "nisa",
    tanggalMulai: new Date("2026-11-25T00:00:00"),
    tanggalSelesai: new Date("2026-11-26T00:00:00"),
    alasan: "Keperluan keluarga di Jogja",
    status: "disetujui",
    catatanHrd: "Disetujui.",
    diajukanPada: new Date("2026-10-22T08:30:00"),
  },
  {
    id: "C009",
    karyawanId: "rama",
    tanggalMulai: new Date("2026-12-04T00:00:00"),
    tanggalSelesai: new Date("2026-12-05T00:00:00"),
    alasan: "Menengok orang tua di Semarang",
    status: "disetujui",
    catatanHrd: "Disetujui.",
    diajukanPada: new Date("2026-10-25T14:00:00"),
  },
  {
    id: "C010",
    karyawanId: "budi",
    tanggalMulai: new Date("2026-12-10T00:00:00"),
    tanggalSelesai: new Date("2026-12-11T00:00:00"),
    alasan: "Pernikahan kerabat",
    status: "disetujui",
    catatanHrd: "Disetujui.",
    diajukanPada: new Date("2026-10-26T09:00:00"),
  },
  {
    id: "C011",
    karyawanId: "wulan",
    tanggalMulai: new Date("2026-09-18T00:00:00"),
    tanggalSelesai: new Date("2026-09-18T00:00:00"),
    alasan: "Keperluan pribadi",
    status: "disetujui",
    catatanHrd: "Disetujui.",
    diajukanPada: new Date("2026-09-10T08:00:00"),
  },
  {
    id: "C012",
    karyawanId: "wulan",
    tanggalMulai: new Date("2026-11-12T00:00:00"),
    tanggalSelesai: new Date("2026-11-13T00:00:00"),
    alasan: "Family gathering",
    status: "disetujui",
    catatanHrd: "Disetujui.",
    diajukanPada: new Date("2026-10-28T09:30:00"),
  },
];

// Data contoh awal permintaan tukar cuti
export const permintaan_tukar_cuti = [
  {
    id: "TC001",
    pemohonId: "rama",
    rekanId: "dina",
    pengajuanPemohonId: "C009",
    pengajuanRekanId: "C007",
    alasan: "Ada acara keluarga mendadak di tanggal 20 November, mohon izin tukar jadwal dengan jadwal saya di Desember.",
    catatanRekan: "",
    catatanHrd: "",
    status: "menunggu_karyawan",
    diajukanPada: new Date("2026-11-01T10:00:00"),
    diresponRekanPada: null,
    diputuskanHrdPada: null,
  },
  {
    id: "TC002",
    pemohonId: "nisa",
    rekanId: "budi",
    pengajuanPemohonId: "C008",
    pengajuanRekanId: "C010",
    alasan: "Perlu bertukar jadwal karena tanggal 10 Desember ada perayaan penting di Jogja.",
    catatanRekan: "Disetujui, sudah koordinasi via WhatsApp.",
    catatanHrd: "",
    status: "menunggu_hrd",
    diajukanPada: new Date("2026-11-02T14:30:00"),
    diresponRekanPada: new Date("2026-11-03T09:15:00"),
    diputuskanHrdPada: null,
  },
];
