import { HologramChat } from '../../components/hologram/HologramChat';

export const metadata = {
    title: 'Nexa Hologram Chat',
    description: 'Conversa con un asistente holográfico de IA',
};

export default function HologramChatPage() {
    return (
        <main style={{ minHeight: '100vh', background: '#0f0c29' }}>
            <HologramChat />
        </main>
    );
}
