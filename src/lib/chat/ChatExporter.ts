import { Message } from '../../store/useChatStore';
import { jsPDF } from 'jspdf';

type ChatMessage = Message;

export interface ChatStats {
    totalMessages: number;
    userMessages: number;
    aiMessages: number;
    totalCharacters: number;
    totalWords: number;
    averageWordsPerMessage: number;
    startTime?: number;
    endTime?: number;
}

export class ChatExporter {
    private chatHistory: ChatMessage[];

    constructor(chatHistory: ChatMessage[]) {
        this.chatHistory = chatHistory;
    }

    // Exportar como TXT (simple y legible)
    exportAsTXT(filename = 'conversacion-nexa.txt'): void {
        let content = 'Conversación Nexa AI\n';
        content += `Exportado: ${new Date().toLocaleString()}\n`;
        content += '='.repeat(50) + '\n\n';

        this.chatHistory.forEach((msg, index) => {
            const role = msg.role === 'user' ? 'Tú' : 'Nexa AI';
            const time = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : '';

            content += `[${index + 1}] ${role} ${time}\n`;
            content += `${msg.content}\n\n`;
        });

        this.downloadFile(content, filename, 'text/plain');
    }

    // Exportar como JSON (para importar después)
    exportAsJSON(filename = 'conversacion-nexa.json'): void {
        const data = {
            metadata: {
                exportDate: new Date().toISOString(),
                version: '1.0',
                model: 'Nexa AI',
                messageCount: this.chatHistory.length
            },
            messages: this.chatHistory
        };

        const content = JSON.stringify(data, null, 2);
        this.downloadFile(content, filename, 'application/json');
    }

    // Exportar como PDF (formato profesional)
    exportAsPDF(filename = 'conversacion-nexa.pdf'): void {
        const doc = new jsPDF();

        // Configuración
        doc.setFontSize(16);
        doc.text('Conversación Nexa AI', 20, 20);
        doc.setFontSize(10);
        doc.text(`Exportado: ${new Date().toLocaleString()}`, 20, 30);

        let yPosition = 40;
        const pageHeight = doc.internal.pageSize.height;

        this.chatHistory.forEach((msg, index) => {
            // Salto de página si es necesario
            if (yPosition > pageHeight - 40) {
                doc.addPage();
                yPosition = 20;
            }

            const role = msg.role === 'user' ? 'Tú' : 'Nexa AI';
            doc.setFont('helvetica', 'bold');
            doc.text(`${role}:`, 20, yPosition);
            doc.setFont('helvetica', 'normal');

            // Dividir texto largo
            const lines = doc.splitTextToSize(msg.content, 170);
            doc.text(lines, 30, yPosition + 7);

            yPosition += (lines.length * 6) + 15;
        });

        doc.save(filename);
    }

    // Exportar como Markdown
    exportAsMarkdown(filename = 'conversacion-nexa.md'): void {
        let content = '# Conversación Nexa AI\n\n';
        content += `*Exportado: ${new Date().toLocaleString()}*\n\n`;

        this.chatHistory.forEach(msg => {
            const role = msg.role === 'user' ? '**Tú**' : '**Nexa AI**';
            content += `---\n\n${role}:\n\n${msg.content}\n\n`;
        });

        this.downloadFile(content, filename, 'text/markdown');
    }

    // Método auxiliar para descargar archivos
    private downloadFile(content: string, filename: string, type: string): void {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    // Obtener estadísticas del chat
    getChatStats(): ChatStats {
        const userMessages = this.chatHistory.filter(m => m.role === 'user');
        const aiMessages = this.chatHistory.filter(m => m.role === 'assistant');

        const totalChars = this.chatHistory.reduce((sum, msg) => sum + msg.content.length, 0);
        const totalWords = this.chatHistory.reduce((sum, msg) => {
            return sum + (msg.content.split(/\s+/).length);
        }, 0);

        return {
            totalMessages: this.chatHistory.length,
            userMessages: userMessages.length,
            aiMessages: aiMessages.length,
            totalCharacters: totalChars,
            totalWords: totalWords,
            averageWordsPerMessage: this.chatHistory.length > 0 ? Math.round(totalWords / this.chatHistory.length) : 0,
            startTime: this.chatHistory[0]?.timestamp,
            endTime: this.chatHistory[this.chatHistory.length - 1]?.timestamp
        };
    }
}
