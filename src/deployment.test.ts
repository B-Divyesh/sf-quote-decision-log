import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import config from '../public/staticwebapp.config.json';
import claims from '../.factory/claims.json';

describe('static deployment policy', () => {
  it('ships manifest MIME, real app routes, a designed 404, immutable assets, and security policy', () => {
    expect(config.mimeTypes['.webmanifest']).toBe('application/manifest+json');
    expect(config.routes.some((route) => route.route === '/demo' && route.rewrite === '/index.html')).toBe(true);
    expect(config.routes.some((route) => route.route === '/quote/*' && route.rewrite === '/index.html')).toBe(true);
    expect(config.responseOverrides?.['404']?.rewrite).toBe('/404.html');
    expect(config.routes.find((route) => route.route === '/assets/*')?.headers?.['Cache-Control']).toContain('immutable');
    expect(config.globalHeaders['Content-Security-Policy']).toContain("default-src 'self'");
    expect(config.globalHeaders['Permissions-Policy']).toContain('camera=()');
  });
});

describe('claim contract', () => {
  it('maps every listed claim to exactly one tagged browser test', async () => {
    const sources = `${await readFile(new URL('../tests/claims.spec.ts', import.meta.url), 'utf8')}\n${await readFile(new URL('../tests/app.spec.ts', import.meta.url), 'utf8')}`;
    const listed = claims.map((claim) => claim.id);
    expect(new Set(listed).size).toBe(listed.length);
    for (const id of listed) {
      expect(sources.match(new RegExp(`@claim:${id}(?![a-z0-9-])`, 'g')) ?? [], id).toHaveLength(1);
    }
    const tagged = [...sources.matchAll(/@claim:([a-z0-9-]+)/g)].map((match) => match[1]);
    expect(new Set(tagged)).toEqual(new Set(listed));
  });
});
