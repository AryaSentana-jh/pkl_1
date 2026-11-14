"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAmbilData } from "@/lib/useAmbilData";
import { ambilKaryawan } from "@/lib/data";
import KepalaHalaman from "@/components/KepalaHalaman";
import Ikon from "@/components/Ikon";
import Memuat from "@/components/Memuat";
import Kosong from "@/components/Kosong";
import Gagal from "@/components/Gagal";

// Format nomor WA menjadi tampilan yang mudah dibaca / Format WA number for display
function formatNoWa(no) {
  if (!no) return null;
  const lokal = no.startsWith("62") ? "0" + no.slice(2) : no;
  return lokal.replace(/(\d{4})(\d{4})(\d+)/, "$1-$2-$3");
}

// Rincian Karyawan (PRD 4.7) / Employee detail (PRD 4.7)
export default function HalamanRincianKaryawan() {
  const { id } = useParams();
  const { status, data: k, cobaLagi } = useAmbilData(() => ambilKaryawan(id), [id]);

  return (
    <div className="max-w-2xl space-y-8">
      <KepalaHalaman judul={k ? k.nama : "Rincian Karyawan"} keterangan={k?.email} warna="tinta" ikon="orang">
        <Link href="/admin/karyawan" className="tombol-kedua">
          <Ikon nama="kembali" />
          Data Karyawan
        </Link>
      </KepalaHalaman>

      {status === "memuat" && <Memuat />}
      {status === "gagal" && <Gagal onCobaLagi={cobaLagi} />}
      {status === "berhasil" && k === null && (
        <Kosong teks="Karyawan tidak ditemukan">
          <Link href="/admin/karyawan" className="tombol-utama">Lihat Data Karyawan</Link>
        </Kosong>
      )}
      {/* key={k.id} mengosongkan isian saat pindah ke karyawan lain / key={k.id} resets the form when switching employees */}
      {status === "berhasil" && k && <FormRincian key={k.id} karyawan={k} />}
    </div>
  );
}

const pilihanPeran = [
  { nilai: "karyawan", label: "Karyawan", keterangan: "Mencatat presensi dan mengajukan cuti miliknya." },
  { nilai: "hrd", label: "HRD", keterangan: "Ditambah mengelola karyawan, memutuskan cuti, dan membaca laporan." },
];

// Simpan hanya mengubah tampilan, belum menulis ke Firestore / Save only changes the screen, nothing is written to Firestore
function FormRincian({ karyawan }) {
  const [peran, setPeran] = useState(karyawan.role);
  const [pesan, setPesan] = useState("");

  function simpan(e) {
    e.preventDefault();
    setPesan(`Peran diubah menjadi ${peran === "hrd" ? "HRD" : "Karyawan"} (contoh, belum tersimpan).`);
  }

  const urlWa = karyawan.noWa ? `https://wa.me/${karyawan.noWa}` : null;
  const noWaTampil = formatNoWa(karyawan.noWa);

  return (
    <div className="space-y-5">
      {/* Kartu info kontak karyawan / Employee contact info card */}
      <div className="kartu p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-redup">Info Kontak</h2>

        {/* Email */}
        <div className="flex items-center gap-3">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-latar text-redup">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </span>
          <div>
            <p className="text-xs font-semibold text-redup uppercase tracking-wide">Email</p>
            <p className="font-medium text-teks">{karyawan.email}</p>
          </div>
        </div>

        {/* WhatsApp */}
        <div className="flex items-center gap-3">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-green-50 text-green-600">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-green-600" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
            </svg>
          </span>
          <div className="flex flex-1 items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-redup uppercase tracking-wide">WhatsApp</p>
              {noWaTampil ? (
                <p className="font-medium text-teks">{noWaTampil}</p>
              ) : (
                <p className="text-sm text-redup italic">Belum diisi</p>
              )}
            </div>
            {/* Tombol buka chat WA langsung / Button to open WA chat directly */}
            {urlWa ? (
              <a
                href={urlWa}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-tipis transition hover:bg-green-700 active:scale-95"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                </svg>
                Hubungi via WA
              </a>
            ) : (
              <span className="text-xs text-redup italic">Nomor belum tersedia</span>
            )}
          </div>
        </div>
      </div>

      {/* Form ubah peran (tidak berubah dari sebelumnya) / Role change form (unchanged from before) */}
      <form onSubmit={simpan} className="kartu space-y-5 p-6">
        {/* Pilihan peran berupa kartu radio supaya akibat tiap peran terbaca / Role options as radio cards so each role's effect is readable */}
        <fieldset>
          <legend className="label">Peran</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {pilihanPeran.map((p) => (
              <label
                key={p.nilai}
                className={`cursor-pointer rounded-xl border p-4 transition has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-sedap/40 ${
                  peran === p.nilai ? "border-sedap bg-sedap/5 ring-1 ring-sedap" : "border-tinta/15 hover:border-tinta/40"
                }`}
              >
                <input
                  type="radio"
                  name="peran"
                  value={p.nilai}
                  checked={peran === p.nilai}
                  onChange={(e) => {
                    setPeran(e.target.value);
                    setPesan("");
                  }}
                  className="sr-only"
                />
                <span className="block text-lg font-bold text-tinta">{p.label}</span>
                <span className="mt-1 block text-sm font-medium text-tinta/80">{p.keterangan}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" className="tombol-utama px-8">Simpan</button>
          {pesan && <p role="status" className="font-bold text-tinta">{pesan}</p>}
        </div>
      </form>
    </div>
  );
}
