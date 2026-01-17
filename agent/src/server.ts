import { serve } from '@hono/node-server';
import type { Server } from 'node:http';
import { PORT } from './config';
import { buildApp } from './http/app';
import { attachWebSocketServers } from './http/ws';

export function startServer() {
  const app = buildApp();
  const server = serve({ fetch: app.fetch, port: PORT });
  attachWebSocketServers(server as Server);
  return server;
}
