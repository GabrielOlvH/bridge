import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { canExecute } from './utils';

const execFileAsync = promisify(execFile);

export async function resolveBinary(name: string, envKey?: string): Promise<string | null> {
  const override = envKey ? process.env[envKey] : null;
  if (override && (await canExecute(override))) return override;

  const home = os.homedir();
  const candidatePaths = [
    `/usr/local/bin/${name}`,
    `/opt/homebrew/bin/${name}`,
    `${home}/.local/bin/${name}`,
    `${home}/bin/${name}`,
  ];
  for (const candidate of candidatePaths) {
    if (await canExecute(candidate)) return candidate;
  }
  try {
    const { stdout } = await execFileAsync('which', [name], { timeout: 3000 });
    const resolved = stdout.trim();
    if (resolved) return resolved;
  } catch {}
  try {
    const { stdout } = await execFileAsync('bash', ['-lc', `command -v ${name}`], { timeout: 4000 });
    const resolved = stdout.trim();
    if (resolved) return resolved;
  } catch {}
  return null;
}

export function resolveClaudeRoots(): string[] {
  const env = process.env.CLAUDE_CONFIG_DIR?.trim();
  if (env) {
    return env
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((entry) => {
        const resolved = path.resolve(entry);
        return path.basename(resolved) === 'projects' ? resolved : path.join(resolved, 'projects');
      });
  }
  return [
    path.join(os.homedir(), '.config', 'claude', 'projects'),
    path.join(os.homedir(), '.claude', 'projects'),
  ];
}
