// CLI `pnpm db:setup`: migrasi dan isi awal database (lihat src/db/prepare.ts).
import { prepareDatabase } from "@/db/prepare";

prepareDatabase().catch((e) => {
  console.error(e);
  process.exit(1);
});
