// Mock storage: one JSON file per intake in .tmp/intakes/. SOP: architecture/integrations.md
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export function createMockStorage(root) {
  const dir = join(root, '.tmp', 'intakes');
  return {
    async save(record) {
      await mkdir(dir, { recursive: true });
      await writeFile(join(dir, `${record.intake.submission_id}.json`), JSON.stringify(record, null, 2));
    },
    async list() {
      await mkdir(dir, { recursive: true });
      const files = (await readdir(dir)).filter((f) => f.endsWith('.json'));
      const records = await Promise.all(files.map(async (f) => JSON.parse(await readFile(join(dir, f), 'utf8'))));
      return records.sort((a, b) => b.intake.submitted_at.localeCompare(a.intake.submitted_at));
    },
  };
}
