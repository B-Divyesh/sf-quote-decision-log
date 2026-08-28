import { describe, expect, it } from 'vitest';
import config from '../public/staticwebapp.config.json';

describe('static deployment policy', () => {
  it('ships manifest MIME, immutable hashed assets, CSP, and permissions policy', () => {
    expect(config.mimeTypes['.webmanifest']).toBe('application/manifest+json');
    expect(config.routes.find((route) => route.route === '/assets/*')?.headers?.['Cache-Control']).toContain('immutable');
    expect(config.globalHeaders['Content-Security-Policy']).toContain("default-src 'self'");
    expect(config.globalHeaders['Permissions-Policy']).toContain('camera=()');
  });
});
