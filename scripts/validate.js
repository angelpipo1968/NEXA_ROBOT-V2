import { spawn } from 'child_process';
import chalk from 'chalk';

const runCommand = (command, args, name) => {
    return new Promise((resolve, reject) => {
        console.log(chalk.blue(`\n🚀 Starting ${name}...`));
        const child = spawn(command, args, { stdio: 'inherit', shell: true });

        child.on('close', (code) => {
            if (code === 0) {
                console.log(chalk.green(`✅ ${name} passed!`));
                resolve();
            } else {
                console.error(chalk.red(`❌ ${name} failed with exit code ${code}`));
                reject(new Error(`${name} failed`));
            }
        });

        child.on('error', (err) => {
            console.error(chalk.red(`❌ ${name} failed to start: ${err.message}`));
            reject(err);
        });
    });
};

const main = async () => {
    try {
        console.log(chalk.bold('🔍 Starting Validation Script...'));

        // 1. Linting
        await runCommand('npm', ['run', 'lint'], 'Linting');

        // 2. Type Checking
        await runCommand('npx', ['tsc', '--noEmit'], 'Type Checking');

        // 3. Build
        await runCommand('npm', ['run', 'build'], 'Build');

        console.log(chalk.bold.green('\n🎉 All checks passed! Ready to commit.'));
        process.exit(0);
    } catch (error) {
        console.error(chalk.bold.red('\n💥 Validation failed. Fix errors before committing.'));
        process.exit(1);
    }
};

main();
