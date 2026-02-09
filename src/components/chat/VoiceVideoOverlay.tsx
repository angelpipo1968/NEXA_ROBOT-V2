'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useChatStore } from '@/store/useChatStore';
import { X, Settings2, Mic, MicOff } from 'lucide-react';
import { VoiceSettingsModal } from '../voice/VoiceSettingsModal';

export function VoiceVideoOverlay() {
    const { isVideoMode, toggleVideoMode } = useChatStore();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        let stream: MediaStream | null = null;

        if (isVideoMode) {
            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                .then((mediaStream) => {
                    stream = mediaStream;
                    if (videoRef.current) {
                        videoRef.current.srcObject = mediaStream;
                    }
                })
                .catch((err) => console.error("Error accessing webcam:", err));
        }

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [isVideoMode]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isVideoMode) {
            interval = setInterval(() => {
                setCurrentTime(prev => prev + 1);
            }, 1000);
        } else {
            setCurrentTime(0);
        }
        return () => clearInterval(interval);
    }, [isVideoMode]);

    if (!isVideoMode) return null;

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-between bg-white dark:bg-gray-950 p-6 animate-in fade-in duration-300">
            {/* Top Timer */}
            <div className="mt-4 bg-gray-100 dark:bg-gray-800 px-4 py-1.5 rounded-full text-sm font-medium text-gray-600 dark:text-gray-300 shadow-sm">
                {formatTime(currentTime)} / 10:00
            </div>

            {/* Main Content - Webcam Feed */}
            <div className="flex-1 w-full max-w-4xl flex items-center justify-center relative my-6">
                <div className="relative w-full aspect-video max-h-[70vh] bg-black rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted={true} // Local preview muted to prevent feedback
                        className="w-full h-full object-cover transform scale-x-[-1]" // Mirror effect
                    />
                </div>
            </div>

            {/* Bottom Controls */}
            <div className="w-full max-w-xl flex items-end justify-between mb-8 px-8">
                {/* Close Button */}
                <button
                    onClick={toggleVideoMode}
                    className="h-14 w-14 rounded-full flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 transition-colors shadow-lg border border-red-100 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400"
                    title="End Call"
                >
                    <X size={24} />
                </button>

                {/* Settings Button */}
                {/* Settings Button */}
                <button
                    onClick={() => setShowSettings(true)}
                    className="h-14 w-14 rounded-full flex items-center justify-center bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors shadow-lg border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                    title="Settings"
                >
                    <Settings2 size={24} />
                </button>

                {/* Center Status */}
                <div className="flex flex-col items-center justify-center pb-2">
                    <div className="flex gap-1 mb-2">
                        <span className="w-1 h-1 bg-gray-800 dark:bg-gray-200 rounded-full" />
                        <span className="w-1 h-1 bg-gray-800 dark:bg-gray-200 rounded-full" />
                        <span className="w-1 h-1 bg-gray-800 dark:bg-gray-200 rounded-full" />
                        <span className="w-1 h-1 bg-gray-800 dark:bg-gray-200 rounded-full" />
                        <span className="w-1 h-1 bg-gray-800 dark:bg-gray-200 rounded-full" />
                    </div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Estoy escuchando
                    </span>
                </div>

                {/* Mic Button */}
                <button
                    onClick={() => setIsMuted(!isMuted)}
                    className={`h-14 w-14 rounded-full flex items-center justify-center transition-colors shadow-lg border ${isMuted
                        ? 'bg-red-50 text-red-500 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30'
                        : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'}`}
                    title="Toggle Mute"
                >
                    {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                </button>
            </div>

            <VoiceSettingsModal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                onSave={(voiceId) => {
                    console.log('Voice selected:', voiceId);
                    // Here we would persist the selection or update the chat context
                    setShowSettings(false);
                }}
            />
        </div >
    );
}
