"use client";

import Link from "next/link";
import { usePengguna, gantiPengguna } from "@/lib/pengguna";
import { users } from "@/lib/dataContoh";

export default function BilahAtas() {
  const { pengguna } = usePengguna();

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 bg-sedap px-4 py-3 text-white md:px-6">
      <Link href="/beranda" className="flex items-center gap-2.5">
        <span className="grid h-9 w-9 place-items-center rounded-lg border border-tinta/10 bg-kunyit text-lg font-bold text-tinta shadow-tipis">
          S
        </span>
        <span className="text-xl font-bold tracking-tight">Portal HRIS</span>
      </Link>

      <div className="flex items-center gap-4">
        {/* Fitur Beralih Akun (Simulasi Cepat untuk Menguji Alur Tukar Cuti Karyawan A -> Karyawan B -> HRD) */}
        <div className="hidden sm:flex items-center gap-2 rounded-xl bg-white/10 px-2.5 py-1 text-xs text-white/90">
          <span className="font-medium text-kunyit">Simulasi Akun:</span>
          <select
            value={pengguna?.uid ?? "dina"}
            onChange={(e) => gantiPengguna(e.target.value)}
            className="cursor-pointer rounded-lg bg-sedap/80 px-2 py-1 font-semibold text-white focus:outline-none focus:ring-2 focus:ring-kunyit"
            title="Ganti akun untuk menguji persetujuan Tukar Cuti"
          >
            {users.map((u) => (
              <option key={u.id} value={u.id} className="bg-panel text-tinta">
                {u.nama} ({u.role === "hrd" ? "HRD" : "Karyawan"})
              </option>
            ))}
          </select>
        </div>

        {pengguna && (
          <div className="flex items-center gap-3">
            <div className="text-right leading-tight">
              <div className="text-sm font-bold">{pengguna.nama}</div>
              <div className="text-xs font-semibold text-kunyit">
                {pengguna.role === "hrd" ? "HRD" : "Karyawan"}
              </div>
            </div>
            {/* Inisial nama sebagai avatar */}
            <span className="grid h-10 w-10 place-items-center rounded-full border border-tinta/10 bg-krem font-bold text-tinta shadow-tipis">
              {pengguna.nama.charAt(0)}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
