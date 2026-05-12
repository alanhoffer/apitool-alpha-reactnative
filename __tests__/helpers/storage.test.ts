import fs from 'fs';
import path from 'path';

const projectRoot = path.resolve(__dirname, '../..');

describe('mobile hardening config', () => {
  it('stores the web session token in sessionStorage instead of localStorage', () => {
    const storageFile = fs.readFileSync(path.join(projectRoot, 'helpers', 'storage.ts'), 'utf8');

    expect(storageFile).toContain('sessionStorage');
    expect(storageFile).not.toContain('localStorage');
  });

  it('disables Android cleartext traffic in Expo config and manifest', () => {
    const appConfig = fs.readFileSync(path.join(projectRoot, 'app.json'), 'utf8');
    const manifest = fs.readFileSync(
      path.join(projectRoot, 'android', 'app', 'src', 'main', 'AndroidManifest.xml'),
      'utf8'
    );

    expect(appConfig).toContain('"usesCleartextTraffic": false');
    expect(manifest).toContain('android:usesCleartextTraffic="false"');
  });
});
