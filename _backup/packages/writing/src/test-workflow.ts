import { BookWritingWorkflow } from './workflow/book-workflow';

async function testWorkflow() {
    const workflow = new BookWritingWorkflow();
    const seed = "Una novela de ciencia ficción sobre una IA que descubre el arte.";

    console.log('🚀 Iniciando flujo de escritura profesional...');

    try {
        const result = await workflow.executeWorkflow(seed);

        console.log('\n✅ Flujo completado con éxito:');
        console.log('--- Resumen del Libro ---');
        console.log(`Título: ${result.book.title}`);
        console.log(`Concepto: ${result.book.seed}`);
        console.log(`Capítulos generados: ${result.book.content.length}`);
        console.log('\n--- Paquete de Exportación ---');
        console.log(`Archivos: ${result.package.files.join(', ')}`);
        console.log(`Validaciones: ${result.package.validations.join(', ')}`);

    } catch (error) {
        console.error('❌ Error en el flujo:', error);
    }
}

testWorkflow();
