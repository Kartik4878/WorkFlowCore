// Simple JavaScript entry point to run the TypeScript app
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// First generate Prisma client
const prismaGenerate = spawn('npx', ['prisma', 'generate'], { stdio: 'inherit', shell: true });

prismaGenerate.on('close', (code) => {
  if (code !== 0) {
    console.error('Prisma client generation failed');
    process.exit(code);
  }
  
  // Then compile TypeScript
  const tsc = spawn('npx', ['tsc'], { stdio: 'inherit', shell: true });
  
  tsc.on('close', (code) => {
    if (code !== 0) {
      console.error('TypeScript compilation failed');
      process.exit(code);
    }
    
    // Then run the compiled JavaScript
    const node = spawn('node', [join(__dirname, 'dist', 'app.js')], { 
      stdio: 'inherit',
      shell: true
    });
    
    node.on('close', (code) => {
      process.exit(code);
    });
  });
});