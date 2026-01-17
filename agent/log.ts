import { PORT } from './config';

export function logStartup() {
  console.log(`tmux agent listening on http://localhost:${PORT}`);
}
