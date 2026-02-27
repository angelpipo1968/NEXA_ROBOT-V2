const fs = require('fs');
const { spawn } = require('child_process');

const config = JSON.parse(fs.readFileSync('c:\\nexa\\mcp_config.json', 'utf8'));
const servers = config.mcpServers;

async function testServer(name, serverConfig) {
    if (serverConfig.disabled) return;
    if (!serverConfig.command) return;

    return new Promise((resolve) => {
        const cmd = process.platform === 'win32' && serverConfig.command === 'npx' ? 'npx.cmd' : serverConfig.command;
        const env = Object.assign({}, process.env, serverConfig.env || {});

        console.log(`[TEST] Starting ${name}...`);
        const child = spawn(cmd, serverConfig.args, { env, shell: false });

        let stdout = '';
        let stderr = '';

        child.stdout.on('data', d => stdout += d.toString());
        child.stderr.on('data', d => stderr += d.toString());

        let exited = false;

        child.on('error', err => {
            exited = true;
            console.log(`[FAIL] ${name} error: ${err.message}`);
            resolve();
        });

        child.on('exit', code => {
            exited = true;
            if (code !== 0) {
                console.log(`[FAIL] ${name} exited with code ${code}`);
                // Print a snippet of stderr
                if (stderr) {
                    console.log(`   STDERR: \n${stderr.trim().split('\n').filter(l => !l.includes('npm WARN')).slice(-5).join('\n')}`);
                }
            } else {
                console.log(`[OK] ${name} exited successfully? (Unexpected for long running MCP)`);
            }
            resolve();
        });

        setTimeout(() => {
            if (!exited) {
                console.log(`[OK] ${name} stays alive. Attempting initialization request if stdio...`);
                // Send initialization request
                const rpc = JSON.stringify({
                    jsonrpc: "2.0",
                    id: 1,
                    method: "initialize",
                    params: {
                        protocolVersion: "2024-11-05", // The correct MCP protocol version
                        capabilities: {},
                        clientInfo: { name: "TestClient", version: "1.0.0" }
                    }
                }) + "\n";
                child.stdin.write(rpc);

                // wait 2 more seconds
                setTimeout(() => {
                    child.kill();
                    if (stdout.includes('"method":"initialize"') || stdout.includes('"result":')) {
                        console.log(`[PASS] ${name} responded to initialize.`);
                    } else if (stdout.trim().length > 0) {
                        console.log(`[PASS?] ${name} generated output: ${stdout.slice(0, 100).replace(/\n/g, '\\n')}`);
                    } else {
                        // Some servers like supergateway don't use stdio JSON-RPC if it's SSE, but supergateway works via stdio for the client
                        console.log(`[WARN] ${name} alive but no init response? STDERR: ${stderr.slice(0, 100).replace(/\n/g, '\\n')}`);
                    }
                    resolve();
                }, 3000);
            }
        }, 3000);
    });
}

async function runAll() {
    for (const [name, cfg] of Object.entries(servers)) {
        await testServer(name, cfg);
    }
}
runAll();
