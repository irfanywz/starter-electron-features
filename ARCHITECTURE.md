# Architecture

Dokumen ini buat ngerti **gimana starter ini disusun dan kenapa**. Cara pakai singkat ada di [README.md](README.md).

## Gambaran umum

Tiga proses Electron, dipisah ketat:

```
┌──────────────┐  contextBridge   ┌──────────────┐   IPC (invoke/send)  ┌──────────────┐
│  renderer    │ ───────────────► │   preload    │ ───────────────────► │     main     │
│  React UI    │  window.api      │  (sandbox)   │                      │  Node/Electron│
└──────────────┘ ◄─────────────── └──────────────┘ ◄─────────────────── └──────────────┘
                   event (onChange)                    webContents.send
```

- **renderer** nggak punya akses Node/Electron. Semua lewat `window.api` (typed).
- **preload** cuma jembatan: bungkus `ipcRenderer` jadi fungsi bernama. Nggak ada logika.
- **main** pegang semua yang butuh OS: window, tray, file, shortcut, auto-start.
- **shared** (`src/shared/`) isinya tipe dan konstanta yang dipakai ketiganya (alias `@shared`).

Prinsip utama: **satu sumber kebenaran per hal**. Nama channel IPC cuma ada di `shared/ipc.ts`, definisi setting cuma ada di `shared/settings.ts`.

## Struktur folder

```
build/                 icon.ico + icon.png (dipakai electron-builder)
resources/             icon.png (window), tray.png (tray); disalin ke luar asar (extraResources)
scripts/               init.mjs (ganti identitas), zip.mjs (bungkus hasil build)
.github/workflows/     ci.yml, release.yml
src/
├── shared/
│   ├── ipc.ts         channel IPC + tipe
│   └── settings.ts    tipe setting, default, validator
├── main/
│   ├── index.ts       urutan startup
│   ├── paths.ts       lokasi data (portable)
│   ├── settings.ts    baca/tulis settings.json
│   ├── settingsApply.ts   validasi + efek samping + broadcast perubahan
│   ├── security.ts    blok navigasi, permission, menu
│   ├── logger.ts      electron-log -> <Data>/logs
│   ├── assets.ts      load icon dari resources/
│   ├── window.ts, windowState.ts, tray.ts, autostart.ts, shortcut.ts, utils.ts
│   └── ipc/           1 file = 1 fitur, didaftarin di ipc/index.ts
├── preload/index.ts   contextBridge -> window.api
└── renderer/src/
    ├── main.tsx, styles.css, env.d.ts
    ├── app/           kerangka: App, AppLayout, TitleBar (menu + window control), NavItem, router, routes, ErrorBoundary, ErrorFallback, RouteError
    ├── features/      1 folder = 1 fitur (home, settings, toast). Tiap fitur punya index.ts sebagai API publik
    │   ├── home/      HomePage
    │   ├── settings/  SettingsPage, ThemeToggle, store.ts (useSettingsStore)
    │   └── toast/     ToastHost, toast, store.ts (useToastStore)
    ├── components/ui/ komponen generik tanpa logika fitur (Switch)
    ├── lib/           helper tanpa React: api.ts (pintu ke window.api), errors.ts
    └── assets/        logo.png (dipakai TitleBar)
```

## Urutan startup

Urutan di `src/main/index.ts` **penting**, jangan dituker:

1. `setupDataPaths()`: set `userData`, `sessionData`, `crashDumps`. Harus paling awal, sebelum apa pun yang nulis ke disk atau minta single-instance lock.
2. `setupLogger()`: log ikut ke folder data.
3. `setupSecurity()`: daftarin handler `web-contents-created` sebelum window mana pun dibuat.
4. `requestSingleInstanceLock()`: instance kedua cuma fokusin window yang ada.
5. Saat `ready`: `applyAllSettings()` (tema, auto-start, shortcut) -> `registerIpc()` -> `createMainWindow()` -> `createTray()`. Setting diterapkan sebelum window dibuat supaya warna latar awal sudah benar.

## Data & portable

Semua data disimpan di `<Nama Exe>_Data/` sejajar exe, jadi memindahkan folder app (exe + `_Data`) memindahkan datanya juga. Diatur di `src/main/paths.ts`:

| Kondisi               | Lokasi data                                    |
| --------------------- | ---------------------------------------------- |
| Build Windows / Linux | `<folder exe>/<Nama Exe>_Data`                 |
| Build macOS           | `<folder yang berisi .app>/<Nama Exe>_Data`    |
| Dev                   | `<project>/.dev-data`                          |
| Folder exe read-only  | fallback ke lokasi default OS (dicatat di log) |

Nama folder diambil dari nama exe, jadi otomatis ikut kalau `productName` diganti.

## Settings

Satu alur untuk semua setting user (tema, auto-start, close-to-tray, dll):

```
renderer: update({ theme: 'dark' })
   └─ preload: settings.set(patch)
        └─ main/ipc/settings.ts -> settingsApply.setSettings(patch)
             1. validasi tiap key (validators di shared/settings.ts)
             2. jalankan efek samping kalau ada (effects di settingsApply.ts)
             3. simpan ke settings.json (settings.ts, tulis atomik: file temp lalu rename)
             4. broadcast `settings:changed` ke semua window + tray
```

- Key yang gagal (mis. shortcut dipakai app lain) **tidak disimpan**; pesan errornya dikembalikan ke renderer lewat `errors`.
- `settings.json` juga nyimpen state internal (`window`: posisi/ukuran) yang **tidak** diexpose ke renderer.
- File rusak atau field invalid jatuh ke default per field, bukan gagal total.

**Nambah setting baru** (contoh `compactMode: boolean`), semua di `src/shared/settings.ts`:

1. tambah field di `Settings`
2. tambah nilai di `defaultSettings`
3. tambah validator di `validators` (TypeScript error kalau lupa)

Di renderer: `useSettingsStore((s) => s.settings?.compactMode)` dan `update({ compactMode: true })`. Di main: `getSettings().compactMode`. Kalau butuh efek ke OS, tambah fungsi di `effects` pada `settingsApply.ts` (return string = pesan error).

## IPC (selain setting)

Selalu 3 langkah:

1. `src/shared/ipc.ts`: tambah channel + tipe
2. `src/main/ipc/<fitur>.ts`: `ipcMain.handle(...)`, lalu daftarin di `ipc/index.ts`
3. `src/preload/index.ts`: expose di object `api`

Handler di main **memvalidasi input** (tipe `unknown`) karena renderer dianggap tidak tepercaya.

## Window, tray, close behavior

- Window frameless dengan titlebar custom (`TitleBar.tsx`).
- Tombol close: kalau `closeToTray` aktif, window di-hide (flag `quitting` di `window.ts` bedain close biasa vs quit beneran); kalau mati, window ketutup dan app quit lewat `window-all-closed`. Quit dari tray selalu jalan.
- `startMinimized` (atau flag `--hidden`) bikin app langsung ke tray tanpa munculin window.
- Posisi/ukuran/maximized disimpan (di-debounce 400 ms). Posisi dibuang kalau monitornya sudah nggak ada.

## Keamanan

- `contextIsolation: true`, `sandbox: true`, `nodeIntegration: false`. Jangan diubah.
- CSP di `renderer/index.html`.
- `security.ts` berlaku untuk **semua** webContents: navigasi ke luar app diblok (link http/https dibuka di browser default), `webview` diblok, permission ditolak kecuali `clipboard-sanitized-write`.
- Build normal: `devTools` mati dan menu default dibuang (Ctrl+R / Ctrl+Shift+I mati). Flag `--debug` (atau dev) mengaktifkan lagi, ditentukan oleh `debug` di `utils.ts`.
- Butuh permission lain (kamera, notifikasi, ...)? Tambah ke `allowedPermissions` di `security.ts`.

## Error handling & logging

- Log ke `<Data>/logs/main.log` lewat electron-log (rotasi di 1 MB). Main: `import { log } from './logger'`. Renderer: `window.api.log.info|warn|error(...)`.
- Error yang nggak ketangkap di main dan renderer (`error`, `unhandledrejection`) otomatis masuk log.
- Error render React: `ErrorBoundary` (terluar) + `errorElement` di `router.tsx`. Error di halaman nggak menjatuhkan sidebar/titlebar; error di `Layout` diganti halaman fallback fullscreen.

## Build & release

- `electron-vite build` menghasilkan `out/` (main, preload, renderer).
- `electron-builder` target `dir` menghasilkan folder unpacked (`release/win-unpacked`), bukan single exe, jadi nggak ada extract ke temp tiap start.
- `resources/` disalin ke luar `app.asar` lewat `extraResources`. Icon dibaca dengan `createFromPath`, yang nggak andal kalau file ada di dalam asar.
- `scripts/zip.mjs` membungkus folder unpacked jadi `release/<productName> <version>.zip` (satu folder `<productName>/` di dalamnya).
- Cache download Electron di `./.electron-cache` (`electronDownload.cache`).
- Release otomatis: push tag `v*` -> `release.yml` build di Windows -> zip diupload ke GitHub Release.

## Konvensi

- IPC: 1 file = 1 fitur di `main/ipc/`. Renderer: 1 folder = 1 fitur di `features/`. Store dinamai `store.ts` di dalam folder fiturnya.
- Alias: `@shared` (main + preload + renderer), `@` (khusus renderer, = `src/renderer/src`).
- Warna dan font lewat token di `styles.css` (`:root` + `prefers-color-scheme`); `nativeTheme.themeSource` yang ngatur `prefers-color-scheme` di renderer, jadi toggle tema nggak butuh JS tambahan di UI.
- Library yang di-bundle Vite (React, router, zustand, lucide) ada di `devDependencies`; cuma yang di-`require` main process (mis. `electron-log`) yang masuk `dependencies`. Ini yang menjaga ukuran paket build.
- **Halaman baru**: buat `features/nama/NamaPage.tsx` + `features/nama/index.ts`, lalu tambah satu objek di `app/routes.tsx`. Route dan menu dibangun dari daftar itu, jadi tidak ada file lain yang perlu diedit. Field `placement` menentukan letak di titlebar: `'start'` (menu dengan label, kiri) atau `'end'` (ikon saja, kanan).
- **Test**: `npm run test`. Setup dan mock `window.api` ada di `tests/setup.ts`. Test mengikuti struktur `src/`, misalnya `features/toast/store.ts` diuji oleh `tests/features/toast/store.test.ts`.
- **Aturan dependency** (ditegakkan ESLint): fitur hanya impor dari `index.ts` fitur lain (atau dari `@/features/toast`, yang global), dan tidak boleh impor `app/`. `components/` dan `lib/` tidak boleh impor `app/` atau `features/`. Kalau dua fitur perlu berbagi, pindahkan ke `lib/` atau `components/ui/`.
- **Akses ke main process**: selalu lewat `api` dari `@/lib/api`, bukan `window.api` langsung.
- Toast: `toast.info | success | warning | error('pesan', { duration })` dari `@/features/toast`, bisa dipanggil di luar komponen.

## Catatan platform

- **Start at login**: cuma build Windows/macOS. Dipanggil ulang tiap start, jadi kalau folder app dipindah, entry-nya ikut update begitu app dibuka sekali.
- **Global shortcut**: kalau dipakai app lain, muncul toast error dan shortcut lama tetap aktif. Format: <https://www.electronjs.org/docs/latest/api/accelerator>.
- **Tray di Linux**: klik kiri nggak selalu terkirim, pakai menu klik kanan.
- **macOS**: menu aplikasi dipertahankan (butuh buat Cmd+C/V/Q); build macOS belum disiapkan di `electron-builder.yml`.
