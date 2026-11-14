// Warna status dari PRD 5.2 dan status alur Tukar Cuti. Teks gelap dipakai supaya tetap terbaca di atas warna terang
const gaya = {
  menunggu: { label: "Menunggu", kelas: "border-menunggu bg-menunggu/20", titik: "bg-menunggu" },
  disetujui: { label: "Disetujui", kelas: "border-disetujui bg-disetujui/20", titik: "bg-disetujui" },
  ditolak: { label: "Ditolak", kelas: "border-ditolak bg-ditolak/15", titik: "bg-ditolak" },

  // Status Alur Tukar Cuti (PRD Alur Bertingkat Karyawan B -> HRD)
  menunggu_karyawan: {
    label: "Menunggu Persetujuan Karyawan",
    kelas: "border-amber-400 bg-amber-50 text-amber-900",
    titik: "bg-amber-500",
  },
  ditolak_karyawan: {
    label: "Ditolak oleh Karyawan",
    kelas: "border-rose-400 bg-rose-50 text-rose-900",
    titik: "bg-rose-500",
  },
  menunggu_hrd: {
    label: "Menunggu Persetujuan HRD",
    kelas: "border-blue-400 bg-blue-50 text-blue-900",
    titik: "bg-blue-600 animate-pulse",
  },
  disetujui_hrd: {
    label: "Disetujui HRD",
    kelas: "border-emerald-500 bg-emerald-50 text-emerald-900",
    titik: "bg-emerald-600",
  },
  ditolak_hrd: {
    label: "Ditolak HRD",
    kelas: "border-red-500 bg-red-50 text-red-900",
    titik: "bg-red-600",
  },
};

export default function PilStatus({ status }) {
  const s = gaya[status] ?? { label: status, kelas: "border-redup bg-latar", titik: "bg-redup" };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-semibold text-tinta ${s.kelas}`}>
      <span className={`h-2 w-2 rounded-full ${s.titik}`} />
      {s.label}
    </span>
  );
}
