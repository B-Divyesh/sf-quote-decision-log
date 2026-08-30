import { describe, expect, it } from 'vitest';
import config from '../public/staticwebapp.config.json';

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
