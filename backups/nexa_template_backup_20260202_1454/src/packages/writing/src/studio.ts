import { DeepThoughtEngine } from './brain/deep-thinking';
import { BookArchitect } from './scaffold/book-architect';
import { ProfessionalWritingEngine } from './prose/writing-engine';
import { SmartResearcher } from './research/smart-researcher';
import { ProfessionalExporter } from './export/professional-exporter';
import { QualityAnalyst } from './quality/analyst';
import { WorkflowOrchestrator } from './workflow/orchestrator';

export class NexaWritingStudio {
    public deepThinker: DeepThoughtEngine;
    public bookArchitect: BookArchitect;
    public writingEngine: ProfessionalWritingEngine;
    public researcher: SmartResearcher;
    public exporter: ProfessionalExporter;
    public qualityAnalyst: QualityAnalyst;
    public workflowOrchestrator: WorkflowOrchestrator;

    constructor() {
        this.deepThinker = new DeepThoughtEngine();
        this.bookArchitect = new BookArchitect();
        this.writingEngine = new ProfessionalWritingEngine();
        this.researcher = new SmartResearcher();
        this.exporter = new ProfessionalExporter();
        this.qualityAnalyst = new QualityAnalyst();
        this.workflowOrchestrator = new WorkflowOrchestrator();

        console.log("🏙️ Nexa Writing Studio Fully Integrated");
    }

    async createCompleteBook(seedIdea: string) {
        return await this.workflowOrchestrator.executeCompleteFlow(seedIdea);
    }
}
