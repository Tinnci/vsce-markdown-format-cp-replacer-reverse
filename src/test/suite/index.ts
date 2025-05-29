import * as path from 'path';
import Mocha from 'mocha';
import { globSync } from 'glob';
import { runTests } from '@vscode/test-electron';

async function main() {
	// Create the mocha test
	const mocha = new Mocha({
		ui: 'tdd',
		color: true
	});

	const testsRoot = path.resolve(__dirname, '..');

	// Use globSync to find test files
	const files: string[] = globSync('**/**.test.js', { cwd: testsRoot });

	// Add files to the mocha run
	files.forEach((f: string) => mocha.addFile(path.resolve(testsRoot, f)));

	// Run the mocha tests
	try {
		mocha.run((failures: number) => {
			if (failures > 0) {
				console.error(`${failures} tests failed.`);
				process.exit(1);
			} else {
				process.exit(0);
			}
		});
	} catch (err: any) { // Explicitly type err as any for now
		console.error('Failed to run tests');
		process.exit(1);
	}
}

main();
