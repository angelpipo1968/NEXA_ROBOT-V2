import { ToolOrchestrator } from './src/packages/tools/src/orchestrator';

async function test() {
    console.log("Starting Tool Orchestrator...");
    const orchestrator = new ToolOrchestrator();

    // Wait for async discovery
    await new Promise(r => setTimeout(r, 2000));

    const tools = orchestrator.getToolsDefinitions();
    console.log(`Total tools found: ${tools.length}`);
    tools.forEach(t => console.log(` - ${t.name}`));
}

test().catch(console.error);
