import { NexaWritingStudio } from './studio';

async function testStudio() {
    const studio = new NexaWritingStudio();
    const seed = "Un libro de cocina para alienígenas: Recetas intergalácticas.";

    console.log('🌌 --- NEXA WRITING STUDIO UNIFIED TEST ---');

    try {
        const result = await studio.createCompleteBook(seed);

        console.log('\n🌟 Studio Execution Successful!');
        console.log(`- Project ID: ${result.id}`);
        console.log(`- Title: ${result.concept.title}`);
        console.log(`- Quality Score: ${result.metrics.professionalLevel * 100}%`);
        console.log(`- Export Package: ${result.exportPackage.files.join(', ')}`);
        console.log(`- Recommendations: ${result.metrics.recommendations.join(', ')}`);

    } catch (error) {
        console.error('❌ Studio Error:', error);
    }
}

testStudio();
