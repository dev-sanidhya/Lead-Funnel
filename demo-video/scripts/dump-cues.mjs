import { cues, TOTAL, S } from '../src/timeline.js';
import fs from 'node:fs';
fs.writeFileSync(new URL('./cues.json', import.meta.url), JSON.stringify({ total: TOTAL, S, cues: cues() }, null, 1));
console.log('cues', cues().length);
