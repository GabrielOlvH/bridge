import { Host } from '@/lib/types';

function getHostTarget(host: Host): string {
  try {
    const url = new URL(host.baseUrl);
    return host.sshHost || url.hostname;
  } catch {
    return host.sshHost || host.baseUrl;
  }
}

function buildSshTarget(host: Host): string {
  const target = getHostTarget(host);
  if (!target) return '';
  return host.username ? `${host.username}@${target}` : target;
}

function buildSshArgs(host: Host): { portArg: string; identityArg: string } {
  const portArg = host.sshPort ? `-p ${host.sshPort}` : '';
  const identityArg = host.identityFile ? `-i ${host.identityFile}` : '';
  return { portArg, identityArg };
}

export function buildAttachCommand(host: Host, sessionName: string): string {
  return buildCommand(host, sessionName, 'attach');
}

export function buildNewAttachCommand(host: Host, sessionName: string): string {
  return buildCommand(host, sessionName, 'new');
}

function buildCommand(host: Host, sessionName: string, mode: 'attach' | 'new'): string {
  const target = buildSshTarget(host);
  const { portArg, identityArg } = buildSshArgs(host);
  const tmuxCommand = mode === 'attach'
    ? `tmux attach -t ${sessionName}`
    : `tmux new -A -s ${sessionName}`;

  if (host.connection === 'mosh') {
    const sshArgs = [portArg, identityArg].filter(Boolean).join(' ');
    const sshWrapper = sshArgs ? `--ssh="ssh ${sshArgs}"` : '';
    return `mosh ${sshWrapper} ${target} -- ${tmuxCommand}`.trim();
  }

  const sshParts = ['ssh', portArg, identityArg, '-t', target].filter(Boolean).join(' ');
  return `${sshParts} "${tmuxCommand}"`;
}
