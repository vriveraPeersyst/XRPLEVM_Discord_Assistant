// src/cliUtils.ts
import readline from 'readline';

/**
 * Prompts the user in the console with a yes/no question,
 * returns true for “y” or “yes” (case‐insensitive).
 */
export function askYesNo(question: string): Promise<boolean> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      const cleaned = answer.trim().toLowerCase();
      resolve(cleaned === 'y' || cleaned === 'yes');
    });
  });
}
