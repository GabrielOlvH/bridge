import { runTmux } from './tmux';

export async function listSessions(): Promise<string> {
  return runTmux([
    'list-sessions',
    '-F',
    '#{session_name}||#{session_windows}||#{session_created}||#{session_attached}||#{session_last_attached}',
  ]);
}
