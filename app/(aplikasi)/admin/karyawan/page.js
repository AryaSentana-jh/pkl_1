"use client";

import { useState } from "react";
import Link from "next/link";
import { useAmbilData } from "@/lib/useAmbilData";
import { ambilSemuaKaryawan } from "@/lib/data";
import KepalaHalaman from "@/components/KepalaHalaman";
import Ikon from "@/components/Ikon";
import Memuat from "@/components/Memuat";
import Kosong from "@/components/Kosong";
import Gagal from "@/components/Gagal";

// Format nomor WA menjadi tampilan yang mudah dibaca, mis. 6281234567001 -> 0812-3456-7001
// Format WA number for display, e.g. 6281234567001 -> 0812-3456-7001
function formatNoWa(no) {
  if (!no) return null;
  // Ubah awalan 62 ke 0 / Replace leading 62 with 0
  const lokal = no.startsWith("62") ? "0" + no.slice(2) : no;
  // Kelompokkan: 4-4-4 atau 4-4-5 / Group: 4-4-4 or 4-4-5
  return lokal.replace(/(\d{4})(\d{4})(\d+)/, "$1-$2-$3");
}

// Tombol ikon WhatsApp yang langsung membuka chat wa.me / WhatsApp icon button that opens wa.me chat directly
function TombolWa({ noWa, nama }) {
  if (!noWa) return <span className="text-xs text-redup">—</span>;
  const url = `https://wa.me/${noWa}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title={`Hubungi ${nama} di WhatsApp`}
      className="inline-flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 transition hover:bg-green-100 hover:border-green-300 active:scale-95"
    >
      {/* Ikon WhatsApp inline SVG agar tidak butuh paket tambahan / Inline WhatsApp SVG so no extra package is needed */}
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-green-600" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
      </svg>
      {formatNoWa(noWa)}
    </a>
  );
}

// Data Karyawan (PRD 4.7). Tanpa pemeriksaan peran, lihat Sesi 6 / Employee data (PRD 4.7). No role check, see Session 6
export default function HalamanDataKaryawan() {
  const { status, data, cobaLagi } = useAmbilData(ambilSemuaKaryawan);
  const [cari, setCari] = useState("");

  const tampil = data ? data.filter((k) => k.nama.toLowerCase().includes(cari.trim().toLowerCase())) : [];

  return (
    <div className="space-y-8">
      <KepalaHalaman judul="Data Karyawan" keterangan="Klik nama karyawan untuk melihat rincian dan mengubah perannya." warna="tinta" ikon="tim" />

      <section className="kartu overflow-hidden">
        <div className="border-b border-tinta/10 p-5">
          <label htmlFor="cari" className="sr-only">Cari nama</label>
          <div className="relative max-w-sm">
            <Ikon nama="cari" className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-redup" />
            <input
              id="cari"
              type="search"
              placeholder="Cari nama karyawan"
              value={cari}
              onChange={(e) => setCari(e.target.value)}
              className="isian pl-10"
            />
          </div>
        </div>

        {status === "memuat" && <Memuat />}
        {status === "gagal" && (
          <div className="p-5">
            <Gagal onCobaLagi={cobaLagi} />
          </div>
        )}
        {status === "berhasil" && tampil.length === 0 && (
          <div className="p-5">
            <Kosong teks={cari ? `Tidak ada karyawan bernama "${cari}". Periksa ejaannya.` : "Belum ada karyawan terdaftar."} />
          </div>
        )}
        {status === "berhasil" && tampil.length > 0 && (
          <div className="overflow-x-auto">
            <table className="tabel">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Email</th>
                  <th>WhatsApp</th>
                  <th>Peran</th>
                </tr>
              </thead>
              <tbody>
                {tampil.map((k) => (
                  <tr key={k.id} className="transition hover:bg-krem">
                    <td>
                      <Link href={`/admin/karyawan/${k.id}`} className="flex items-center gap-3 font-bold text-tinta hover:text-sedap">
                        <span className="grid h-9 w-9 place-items-center rounded-full border border-tinta/10 bg-krem text-sm">
                          {k.nama.charAt(0)}
                        </span>
                        {k.nama}
                      </Link>
                    </td>
                    <td className="font-medium text-redup">{k.email}</td>
                    <td>
                      <TombolWa noWa={k.noWa} nama={k.nama} />
                    </td>
                    <td>
                      <span
                        className={`rounded-full border border-tinta/10 px-3 py-0.5 text-xs font-semibold ${
                          k.role === "hrd" ? "bg-terong text-white" : "bg-panel text-tinta"
                        }`}
                      >
                        {k.role === "hrd" ? "HRD" : "Karyawan"}
                      </span>
                    </td>
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
