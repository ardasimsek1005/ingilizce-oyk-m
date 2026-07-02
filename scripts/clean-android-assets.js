import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '../android/app/src/main/assets/public');

const filesToDelete = [
  'server.cjs',
  'server.cjs.map'
];

filesToDelete.forEach(file => {
  const filePath = path.join(publicDir, file);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log('[Capacitor Hook] Excluded and deleted server file: ' + file);
  }
});
