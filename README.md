Readme · MD

# nest-module-toggle

Studi kasus pribadi: cara **mengaktifkan dan menonaktifkan ("mencabut") modul NestJS saat runtime lewat database**, tanpa restart dan tanpa redeploy. Contoh kasusnya adalah ERP dengan modul Product, Inventory, dan Sales.

> Repo ini untuk belajar dan bereksperimen. Mekanisme toggle yang jadi fokus; logika bisnis ERP-nya sengaja minimal.

## Masalah yang dipelajari

Di ERP, tidak semua klien butuh semua modul. Kalau `Sales` meng-import `InventoryService` secara langsung:

- `Sales` tidak bisa hidup tanpa `Inventory` (dependensi keras saat compile-time).
- Mematikan `Inventory` berarti menyebar `if (inventoryEnabled)` di banyak tempat, atau redeploy.

## Idenya

`Sales` hanya bergantung pada sebuah **port** (interface). Implementasi mana yang menjawab ditentukan **setiap panggilan**, berdasarkan status modul di PostgreSQL.

| Status Inventory | Yang akhirnya dipanggil Sales                                          |
| ---------------- | ---------------------------------------------------------------------- |
| `ENABLED`        | `InventoryService` (cek stok sungguhan)                                |
| `DISABLED`       | `InventoryDisabledService` (stok tidak dilacak, penjualan tetap boleh) |

`Sales` tidak pernah tahu yang mana.

```
SalesService -> Port (contracts) -> Gateway -> Resolver -> ModuleState (cache <- DB)
                                                  |
                                    InventoryService | InventoryDisabledService
```

> **DISABLED bukan berarti dihapus dari memory.** Semua class tetap hidup di DI container Nest. DISABLED hanya berarti: Resolver tidak lagi memilih modul itu, route-nya ditolak guard, dan pekerjaan background-nya seharusnya berhenti.

## Konsep utama

| Konsep                      | Tanggung jawab                                                                  |
| --------------------------- | ------------------------------------------------------------------------------- |
| `manifest.ts`               | Metadata statis modul: id, dependensi, capability yang disediakan/dibutuhkan    |
| `ModuleRegistryService`     | `Map` di memory berisi manifest (apa yang ada di kode)                          |
| `ModuleStateService`        | Status ENABLED/DISABLED di PostgreSQL + cache TTL di memory                     |
| `ModuleManagerService`      | Aturan bisnis enable/disable (validasi dependensi, atomik dengan advisory lock) |
| `CapabilityRegistryService` | Memetakan capability ke implementasi saat enabled/disabled                      |
| `CapabilityResolverService` | Memilih implementasi yang berlaku saat ini untuk sebuah capability              |
| Port / Gateway              | Port adalah kontrak; Gateway adalah objek stabil yang diinjeksi ke consumer     |
| Composition root            | Satu-satunya tempat yang tahu semua modul dan menyambungkannya                  |
