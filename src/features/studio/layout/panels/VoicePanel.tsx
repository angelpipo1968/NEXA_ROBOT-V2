import React from 'react';
import { VoiceStudio } from '@/components/voice/VoiceStudio';

export default function VoicePanel() {
    return (
        <div style={{ height: '100%', overflow: 'hidden' }}>
            <VoiceStudio />
        </div>
    );
}
