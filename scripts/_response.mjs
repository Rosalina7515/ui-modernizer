/**
 * Unified JSON response shape (v0.9+).
 *
 * Every script's output (whether JSON or pretty) should pass through these
 * helpers so downstream tools (CI, dashboards, Claude itself) see a stable
 * envelope.
 *
 * Shape:
 *   {
 *     ok:        boolean,
 *     command:   string,                         // 'detect-stack', 'load-config', etc.
 *     version:   string,                         // ui-modernizer version
 *     timestamp: string,                         // ISO 8601
 *     payload:   <any>,                          // when ok=true
 *     errors:    [{ code, title, remedy, docs, details }, ...],  // when ok=false
 *     warnings:  [{ message, ... }]              // optional
 *   }
 */

import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

let cachedVersion = null;
function readVersion() {
  if (cachedVersion) return cachedVersion;
  // Find package.json walking up from this file
  let dir = path.dirname(fileURLToPath(import.meta.url));
  for (let i = 0; i < 5; i++) {
    const p = path.join(dir, 'package.json');
    if (existsSync(p)) {
      try {
        cachedVersion = JSON.parse(readFileSync(p, 'utf8')).version ?? 'unknown';
        return cachedVersion;
      } catch {}
    }
    dir = path.dirname(dir);
  }
  cachedVersion = 'unknown';
  return cachedVersion;
}

function envelope(command, ok, body) {
  return {
    ok,
    command,
    version: readVersion(),
    timestamp: new Date().toISOString(),
    ...body,
  };
}

export function success(command, payload, warnings = []) {
  return envelope(command, true, { payload, ...(warnings.length ? { warnings } : {}) });
}

export function failure(command, errors, warnings = []) {
  const errs = Array.isArray(errors) ? errors : [errors];
  return envelope(command, false, { errors: errs, ...(warnings.length ? { warnings } : {}) });
}
