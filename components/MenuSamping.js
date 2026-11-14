"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePengguna } from "@/lib/pengguna";
import Ikon from "./Ikon";

// Menu HRD hanya untuk role "hrd" (PRD 3.1)
const menuHrd = [
  { href: "/admin", label: "Dasbor HRD", ikon: "dasbor" },
  { href: "/admin/karyawan", label: "Data Karyawan", ikon: "tim" },
  { href: "/admin/cuti", label: "Persetujuan Cuti", ikon: "centang" },
  { href: "/admin/tukar-cuti", label: "Persetujuan Tukar Cuti", ikon: "tukar" },
  { href: "/admin/kalender", label: "Kalender Cuti Tim", ikon: "kalender_tim" },
  { href: "/admin/laporan", label: "Laporan", ikon: "grafik" },
];

function TautanMenu({ href, label, ikon, aktif }) {
  return (
    <Link
      href={href}
      aria-current={aktif ? "page" : undefined}
      className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
        aktif
          ? "bg-kunyit text-tinta shadow-tipis"
          : "text-white/80 hover:bg-white/10 hover:text-white"
      }`}
    >
      <Ikon nama={ikon} />
      {label}
    </Link>
  );
}

export default function MenuSamping() {
  const pathname = usePathname();
  const { pengguna } = usePengguna();

  const aktif = (href, exact = false) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  const diCuti = aktif("/cuti");
  const diDaftarCuti = pathname === "/cuti";
  const diAjukanCuti = aktif("/cuti/baru", true);
  const diKuotaCuti = aktif("/cuti/kuota");
  const diTukarCuti = aktif("/cuti/tukar");

  return (
    <nav className="flex gap-1 overflow-x-auto p-3 md:flex-col md:overflow-visible md:p-4">
      <TautanMenu href="/beranda" label="Beranda" ikon="rumah" aktif={aktif("/beranda")} />
      <TautanMenu href="/presensi" label="Presensi Saya" ikon="jam" aktif={aktif("/presensi")} />

      {/* Menu dropdown Cuti Saya */}
      <details open={diCuti} className="group shrink-0">
        <summary className="flex cursor-pointer list-none items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white">
          <Ikon nama="kalender" />
          Cuti Saya
          <Ikon nama="bawah" className="ml-auto h-4 w-4 transition group-open:rotate-180" />
        </summary>
        <div className="mt-1 flex gap-1 md:ml-4 md:flex-col md:border-l md:border-white/20 md:pl-2">
          <TautanMenu href="/cuti" label="Daftar Cuti" ikon="daftar" aktif={diDaftarCuti} />
          <TautanMenu href="/cuti/baru" label="Ajukan Cuti" ikon="tambah" aktif={diAjukanCuti} />
          <TautanMenu href="/cuti/kuota" label="Kuota Cuti" ikon="kuota" aktif={diKuotaCuti} />
          <TautanMenu href="/cuti/tukar" label="Tukar Cuti" ikon="tukar" aktif={diTukarCuti} />
        </div>
      </details>

      <TautanMenu href="/profil" label="Profil" ikon="orang" aktif={aktif("/profil")} />

      {pengguna?.role === "hrd" && (
        <>
          <p className="hidden px-3 pt-6 pb-2 text-xs font-semibold tracking-wider text-kunyit uppercase md:block">
            Menu HRD
          </p>
          {menuHrd.map((m) => (
            <TautanMenu key={m.href} {...m} aktif={aktif(m.href, m.href === "/admin")} />
          ))}
        </>
      )}
    </nav>
  );
}
