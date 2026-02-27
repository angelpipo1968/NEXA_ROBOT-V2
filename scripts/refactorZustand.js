import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { results = results.concat(walk(file)); }
        else { if (file.endsWith('.tsx') && !file.includes('NexaContext')) results.push(file); }
    });
    return results;
}

const srcDir = path.join(__dirname, '..', 'src');
const files = walk(srcDir);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    if (!content.includes('useNexa')) return;

    let modified = false;

    if (content.match(/import\s+\{\s*useNexa.*?\}\s+from\s+['"]@\/context\/NexaContext['"];?/)) {
        content = content.replace(/import\s+\{\s*useNexa(,.*?)?\s*\}\s+from\s+['"]@\/context\/NexaContext['"];?\n?/,
            (match, p1) => {
                if (p1 && p1.trim() !== '') return `import {${p1.replace(/^,\s*/, '')}} from '@/context/NexaContext';\n`;
                return '';
            });
        modified = true;
    }

    const useNexaMatch = content.match(/const\s+\{\s*([^}]+)\s*\}\s*=\s*useNexa\(\);/);
    if (!useNexaMatch) return;

    const destructuredVars = useNexaMatch[1].split(',').map(s => s.trim().split(':')[0].trim());

    const projectVars = ['projectData', 'updateProjectContent', 'updateTitle', 'saveProject', 'createNewProject', 'loadProject'];
    const uiVars = ['activePanel', 'showRightPanel', 'switchPanel', 'toggleRightPanel'];
    const voiceVars = ['isListening', 'isSpeaking', 'voiceConfig', 'updateVoiceConfig', 'toggleListening', 'speakText', 'initVoiceApi', 'speechRecognitionInst', 'synthesisInst'];
    const aiVars = ['aiSuggestions', 'aiConfig', 'generateAISuggestion', 'generateIdeas', 'improveText', 'continueWriting', 'removeSuggestion'];

    let pStore = [], uStore = [], vStore = [], aStore = [];

    destructuredVars.forEach(v => {
        if (!v) return;
        if (['characters', 'analyzeCharactersInStory', 'removeCharacter', 'addCharacter', 'updateCharacter'].includes(v)) return;

        if (projectVars.includes(v)) pStore.push(v);
        else if (uiVars.includes(v)) uStore.push(v);
        else if (voiceVars.includes(v)) vStore.push(v);
        else if (aiVars.includes(v)) aStore.push(v);
    });

    let newHooks = '';
    let newImports = '';

    if (pStore.length > 0) {
        newImports += `import { useProjectStore } from '@/store/projectStore';\n`;
        newHooks += `    const { ${pStore.join(', ')} } = useProjectStore();\n`;
    }
    if (uStore.length > 0) {
        newImports += `import { useUiStore } from '@/store/uiStore';\n`;
        newHooks += `    const { ${uStore.join(', ')} } = useUiStore();\n`;
    }
    if (vStore.length > 0) {
        newImports += `import { useVoiceStore } from '@/store/voiceStore';\n`;
        newHooks += `    const { ${vStore.join(', ')} } = useVoiceStore();\n`;
    }
    if (aStore.length > 0) {
        newImports += `import { useAiStore } from '@/store/aiStore';\n`;
        newHooks += `    const { ${aStore.join(', ')} } = useAiStore();\n`;
    }

    content = content.replace(useNexaMatch[0], newHooks.trimRight());

    const importMatch = content.match(/import.*?;?\n/g);
    if (importMatch && importMatch.length > 0) {
        const lastImport = importMatch[importMatch.length - 1];
        content = content.replace(lastImport, lastImport + newImports);
    } else {
        content = newImports + content;
    }

    fs.writeFileSync(file, content);
    console.log("Refactored:", file);
});
