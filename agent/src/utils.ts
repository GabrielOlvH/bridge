import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export async function canExecute(filePath: string): Promise<boolean> {
  try {
    await execFileAsync('test', ['-x', filePath], { timeout: 2000 });
    return true;
  } catch {
    return false;
  }
}

export function stripAnsi(text: string): string {
  return text.replace(/\x1b\[[0-9;?]*[ -/]*[@-~]/g, '');
}

export function formatOAuthError(error: unknown): string | null {
  if (!error) return null;
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  return String(error);
}
