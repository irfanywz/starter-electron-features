/**
 * Satu-satunya pintu ke main process (lewat preload).
 * Fitur dan komponen pakai `api` dari sini, bukan `window.api` langsung,
 * supaya kalau nanti ada perubahan IPC cukup dicek di satu tempat.
 */
export const api = window.api
