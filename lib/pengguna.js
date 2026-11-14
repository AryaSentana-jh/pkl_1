"use client";

import { useState, useEffect } from "react";
import { users } from "./dataContoh";

/**
 * Hook usePengguna() mengembalikan { pengguna, memuat }.
 * Hanya ada 1 HRD di sistem Sedap yaitu Wulan (PRD 2.1).
 * Default login diatur ke Wulan agar seluruh modul dan menu HRD langsung terbuka saat diperiksa.
 */

const KUNCI_PENGGUNA = "portal_hris_pengguna_aktif";

export function gantiPengguna(uid) {
  if (typeof window !== "undefined") {
    localStorage.setItem(KUNCI_PENGGUNA, uid);
    window.dispatchEvent(new CustomEvent("portal_hris_pengguna_berubah", { detail: uid }));
  }
}

export function usePengguna() {
  const [pengguna, setPengguna] = useState({
    uid: "wulan",
    nama: "Wulan",
    email: "wulan@sedap.id",
    role: "hrd",
  });
  const [memuat, setMemuat] = useState(false);

  useEffect(() => {
    function muatPengguna() {
      try {
        const idTersimpan = localStorage.getItem(KUNCI_PENGGUNA) || "wulan";
        const profil = users.find((u) => u.id === idTersimpan) || users.find((u) => u.role === "hrd") || users[0];
        setPengguna({
          uid: profil.id,
          nama: profil.nama,
          email: profil.email,
          role: profil.role,
        });
      } catch (e) {
        // Fallback default
      }
    }

    muatPengguna();

    function onBerubah() {
      muatPengguna();
    }

    window.addEventListener("portal_hris_pengguna_berubah", onBerubah);
    return () => window.removeEventListener("portal_hris_pengguna_berubah", onBerubah);
  }, []);

  return { pengguna, memuat };
}
