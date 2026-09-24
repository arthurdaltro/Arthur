// Mock email: writes each message to .tmp/outbox/. SOP: architecture/integrations.md
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export function createMockEmail(root) {
  const dir = join(root, '.tmp', 'outbox');
  return {
    async send(message) {
      await mkdir(dir, { recursive: true });
      const file = `${message.submission_id}-${message.to}-${message.template}.json`;
      await writeFile(join(dir, file), JSON.stringify(message, null, 2));
    },
  };
}
