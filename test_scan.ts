import { useProjectStore } from './src/store/projectStore';
import { useRightPanelStore } from './src/lib/stores/useRightPanelStore';
import { proactiveAgent } from './src/lib/services/proactiveAgent';

async function runTest() {
    // Setup mock code content
    useProjectStore.getState().updateProjectContent(`
function calculate(a: number, b: number) {
    var result = a + b;
    console.log(result);
    return result;
}
    `);

    console.log('--- Initial Content Set ---');
    console.log(useProjectStore.getState().projectData.content);

    console.log('\n--- Forcing Scan ---');
    await proactiveAgent.forceAnalyze();

    console.log('\n--- Scan Results ---');
    const wisdom = useRightPanelStore.getState().wisdomThoughts;
    console.log(JSON.stringify(wisdom, null, 2));
    process.exit(0);
}

runTest().catch(console.error);
