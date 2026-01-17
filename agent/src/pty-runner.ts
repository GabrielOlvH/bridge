import { pty } from './pty';

type PtyCommandOptions = {
  rows?: number;
  cols?: number;
  timeoutMs?: number;
  idleMs?: number;
  cwd?: string;
};

export function runPtyCommand(
  binary: string,
  args: string[],
  input: string,
  options: PtyCommandOptions = {}
): Promise<string> {
  const {
    rows = 60,
    cols = 200,
    timeoutMs = 12000,
    idleMs = 600,
    cwd = process.env.HOME,
  } = options;

  return new Promise((resolve) => {
    let output = '';
    let done = false;
    let idleTimer: ReturnType<typeof setTimeout> | null = null;

    const term = pty.spawn(binary, args, {
      name: 'xterm-256color',
      cols,
      rows,
      cwd,
      env: { ...process.env, TERM: 'xterm-256color', COLORTERM: 'truecolor' },
    });

    const finish = () => {
      if (done) return;
      done = true;
      if (idleTimer) {
        clearTimeout(idleTimer);
      }
      try {
        term.kill();
      } catch {}
      resolve(output);
    };

    const timeout = setTimeout(finish, timeoutMs);

    const scheduleIdle = () => {
      if (idleTimer) {
        clearTimeout(idleTimer);
      }
      idleTimer = setTimeout(() => {
        clearTimeout(timeout);
        finish();
      }, idleMs);
    };

    term.onData((data) => {
      output += data;
      scheduleIdle();
    });

    term.onExit(() => {
      clearTimeout(timeout);
      finish();
    });

    setTimeout(() => {
      term.write(input);
      scheduleIdle();
    }, 200);
  });
}
