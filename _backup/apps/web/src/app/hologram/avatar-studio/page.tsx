import { AvatarPlatform } from '../../../components/hologram/avatar/AvatarPlatform';

export const metadata = {
    title: 'Avatar Studio - NEXA AI Avatar',
    description: 'Crea tu propio avatar holográfico con IA',
};

export default function AvatarStudioPage() {
    return (
        <main style={{ minHeight: '100vh', background: '#f5f7fb' }}>
            <AvatarPlatform />
        </main>
    );
}
