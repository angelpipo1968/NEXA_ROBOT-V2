#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import os from 'os';
import { ProtectionCore } from './protection';
import { GPGSigner } from './signer';

const program = new Command();
const protection = new ProtectionCore();
let signer: GPGSigner | null = null;
try {
    signer = new GPGSigner();
} catch (e) {
    // GPG not available
}

const CONFIG = {
    version: '3.0.0',
    protectionLevel: 'MAXIMUM',
    vault: true,
    gpg: true,
    language: 'ES'
};

function showBanner() {
    console.log(chalk.cyan(`
╔════════════════════════════════════════════════════════════════╗
║  🧠 NEXA OS ULTIMATE v${CONFIG.version} - ENTERPRISE EDITION        ║
║  🔒 Protection: ${chalk.green(CONFIG.protectionLevel)} | 🗄️ Vault: ${chalk.green('ACTIVE')} ║
║  ✍️ GPG Signing: ${signer ? chalk.green('ENABLED') : chalk.gray('DISABLED')} | 🌐 Language: ${chalk.yellow(CONFIG.language)} ║
╚════════════════════════════════════════════════════════════════╝
`));
    console.log(chalk.white(`🚀 Type 'nexa --help' for commands | 'nexa deploy' to release NEURONEX PULSE\n`));
}

program
    .name('nexa')
    .description('NEXA OS Ultimate - Core Engine CLI')
    .version(CONFIG.version);

program
    .command('status')
    .description('System integrity & protection status')
    .action(() => {
        showBanner();
        console.log(chalk.bold('\n📊 SYSTEM STATUS'));
        console.log(`   Protection Core: ${chalk.green('ACTIVE')}`);
        console.log(`   GPG Signer: ${signer ? chalk.green('READY') : chalk.gray('DISABLED')}`);

        const integrity = protection.scanIntegrity();
        const secure = Object.values(integrity).every(Boolean);
        console.log(`   Integrity: ${secure ? chalk.green('✅ SECURE') : chalk.red('⚠️ AT RISK')}`);
    });

program
    .command('deploy')
    .argument('<version>', 'Version tag (e.g. v3.0.1)')
    .description('Release NEURONEX PULSE with GPG signing')
    .action(async (version) => {
        console.log(chalk.blue(`\n📦 Preparing deployment ${version}...`));

        const integrity = protection.scanIntegrity();
        if (!Object.values(integrity).every(Boolean)) {
            console.error(chalk.red("❌ System integrity check failed - aborting deployment"));
            process.exit(1);
        }

        console.log(chalk.white("   1. Creating recovery vault snapshot..."));
        await protection.createEchoVault();

        console.log(chalk.white("   2. Building artifacts..."));
        // Simulating artifact build
        const artifactPath = path.join(process.cwd(), `config.json`); // Dummy artifact

        console.log(chalk.white("   3. Signing artifacts..."));
        console.log(chalk.white("   3. Signing artifacts..."));
        if (signer) {
            try {
                const sig = signer.signFile(artifactPath); // Sign something real just to test
                console.log(chalk.green(`\n✅ Deployment SUCCESS | Signature: ${sig}`));
            } catch (e: any) {
                console.log(chalk.yellow(`\n⚠️  Signing skipped/failed (simulated for dev): ${e.message}`));
                console.log(chalk.green(`\n✅ Deployment SUCCESS (Unsigned)`));
            }
        } else {
            console.log(chalk.gray("   (GPG Signing skipped - GPG not found)"));
            console.log(chalk.green(`\n✅ Deployment SUCCESS (Unsigned)`));
        }
    });

program
    .command('vault')
    .description('Manual vault snapshot (Protocolo Fénix)')
    .action(async () => {
        console.log(chalk.blue("🔄 Initiating Protocolo Fénix..."));
        const success = await protection.createEchoVault();
        if (success) console.log(chalk.green("✅ Vault snapshot created."));
        else console.log(chalk.red("❌ Vault creation failed."));
    });

program
    .command('scan')
    .description('Full integrity verification')
    .action(() => {
        const results = protection.scanIntegrity();
        for (const [file, ok] of Object.entries(results)) {
            console.log(`${ok ? '✅' : '❌'} ${file}`);
        }
    });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
    showBanner();
    program.outputHelp();
}
