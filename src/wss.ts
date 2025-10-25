// Use require to avoid needing @types/ws
// eslint-disable-next-line @typescript-eslint/no-var-requires
const WS = require('ws');
type WebSocket = any;
const WebSocketServer: any = WS.WebSocketServer;
import * as fs from 'fs';
import * as path from 'path';
import { generateReport } from './reportapi';

// Storage for reports on disk
const dataDir = path.resolve(__dirname, '..', 'data');
const reportsFile = path.join(dataDir, 'reports.json');

function ensureStorage() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(reportsFile)) {
    fs.writeFileSync(reportsFile, '[]', 'utf8');
  }
}

function readReports(): any[] {
  ensureStorage();
  try {
    const txt = fs.readFileSync(reportsFile, 'utf8');
    const parsed = JSON.parse(txt);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeReports(reports: any[]) {
  ensureStorage();
  fs.writeFileSync(reportsFile, JSON.stringify(reports, null, 2), 'utf8');
}

// Broadcast helper
function broadcast(wss: any, payload: any) {
  const msg = JSON.stringify(payload);
  wss.clients.forEach((client: any) => {
    if ((client as WebSocket).readyState === WS.OPEN) {
      (client as WebSocket).send(msg);
    }
  });
}

// Start WSS server
const PORT = parseInt(process.env.WSS_PORT || '8081', 10);
const wss: any = new WebSocketServer({ port: PORT });

console.log(`[wss] WebSocket server listening on ws://localhost:${PORT}`);

wss.on('connection', (ws: any) => {
  ws.on('message', async (raw: any) => {
    try {
      const msg = JSON.parse(String(raw));
      const action = msg?.action;

      if (action === 'getReports') {
        const reports = readReports();
        ws.send(JSON.stringify({ event: 'reports', data: reports }));
        return;
      }

      if (action === 'generateReports') {
        const benchmark: string = msg?.benchmark ?? 'OWASP';
        const targets: string[] = Array.isArray(msg?.targets) ? msg.targets : [];

        // Optionally, you could include a requestId for correlation
        const requestId: string | undefined = msg?.requestId;

        // Fire the report generation using the existing function
        try {
          const report = await generateReport(benchmark, targets);

          // Persist it
          const reports = readReports();
          const stored = {
            id: requestId || `${Date.now()}`,
            createdAt: new Date().toISOString(),
            benchmark,
            targets,
            report,
          };
          reports.push(stored);
          writeReports(reports);

          // Notify requester with the newly generated report
          ws.send(JSON.stringify({ event: 'reportGenerated', data: stored }));

          // Notify all clients that reports are updated (frontend can call getReports or use payload)
          broadcast(wss, { event: 'reportsUpdated', data: reports });
        } catch (err: any) {
          const errorPayload = { event: 'error', error: err?.message || String(err) };
          ws.send(JSON.stringify(errorPayload));
        }
        return;
      }

      // Unknown action
      ws.send(JSON.stringify({ event: 'error', error: 'Unknown action' }));
    } catch (err: any) {
      ws.send(JSON.stringify({ event: 'error', error: err?.message || String(err) }));
    }
  });

  // Optional greeting
  ws.send(JSON.stringify({ event: 'hello', data: 'Connected to AI Pentester WSS' }));
});
