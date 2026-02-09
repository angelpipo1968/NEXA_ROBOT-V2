import { toolService } from '@/lib/toolService';
import { geminiClient } from '@/lib/gemini';

/**
 * Auto-detection and forced tool calling for search/price queries
 * This bypasses the ReAct pattern when we detect clear search intent
 */
export async function autoToolDetector(
    content: string,
    assistantMsgId: string,
    updateMessage: (id: string, updates: any) => void,
    setSearching: (searching: boolean) => void,
    getMessages: () => any[]
): Promise<string | null> {

    console.log('[AUTO-TOOL] 🚀 Function called with content:', content);

    const lowerContent = content.toLowerCase();

    // Keywords that trigger automatic search
    const searchKeywords = [
        'precio', 'price', 'busca', 'search',
        'cuál es', 'what is', 'qué es', 'how much',
        'bitcoin', 'ethereum', 'crypto', 'cryptocurrency',
        'weather', 'clima', 'temperatura', 'temperature',
        'news', 'noticias', 'stock', 'bolsa'
    ];

    const needsSearch = searchKeywords.some(keyword => lowerContent.includes(keyword));
    console.log('[AUTO-TOOL] 🔍 Keyword detection result:', needsSearch);
    console.log('[AUTO-TOOL] 📝 Content (lowercase):', lowerContent);

    if (!needsSearch) {
        console.log('[AUTO-TOOL] ❌ No search keywords detected - skipping');
        return null;
    }

    console.log('[AUTO-TOOL] ✅ Search keywords detected! Executing search...');

    try {
        // Update UI
        console.log('[AUTO-TOOL] 💬 Updating message UI...');
        updateMessage(assistantMsgId, { content: '🔍 Buscando información en tiempo real...' });
        setSearching(true);

        // Clean up query
        let query = content
            .replace(/busca|search|cuál es|qué es|what is|how much|el precio de|the price of|dame/gi, '')
            .trim();

        if (!query || query.length < 3) query = content;
        console.log('[AUTO-TOOL] 🎯 Cleaned query:', query);

        // Execute search directly
        console.log('[AUTO-TOOL] 🌐 Calling toolService.execute("search_web", { query })...');
        const toolResult = await toolService.execute('search_web', { query });
        console.log('[AUTO-TOOL] 📊 Tool result length:', toolResult?.length || 0);
        console.log('[AUTO-TOOL] 📄 Tool result preview:', toolResult ? toolResult.substring(0, 200) + '...' : 'null');

        setSearching(false);

        if (!toolResult) {
            console.error('[AUTO-TOOL] ⚠️ No search results returned');
            throw new Error('No search results');
        }

        // Format results with Gemini
        console.log('[AUTO-TOOL] 🤖 Formatting results with Gemini...');
        const context = getMessages().slice(0, -1).map(m => ({
            role: m.role,
            parts: m.content
        }));

        const formattingPrompt = `The user asked: "${content}"

I searched the web and found this information:
${toolResult}

Please provide a clear, concise answer to the user's question using ONLY the search results above. Include specific numbers, prices, or facts from the results.`;

        const geminiResponse = await geminiClient.chat({
            message: formattingPrompt,
            context: context,
            temperature: 0.3 // Lower temperature for more factual responses
        });

        const data = await geminiResponse.json();
        const finalText = data.candidates?.[0]?.content?.parts?.[0]?.text ||
            `Encontré esta información: ${toolResult.substring(0, 500)}`;

        console.log('[AUTO-TOOL] ✅ Success! Final response length:', finalText.length);
        console.log('[AUTO-TOOL] 📝 Final response preview:', finalText.substring(0, 100) + '...');
        return finalText;

    } catch (error) {
        console.error('[AUTO-TOOL] ❌ ERROR:', error);
        console.error('[AUTO-TOOL] ❌ Error stack:', (error as Error).stack);
        setSearching(false);
        return null; // Return null to fall through to normal AI processing
    }
}
