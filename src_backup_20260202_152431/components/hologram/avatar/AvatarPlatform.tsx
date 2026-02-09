'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './AvatarPlatform.module.css';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { avatars } from '../../../data/avatars';
import {
    Robot,
    User,
    Plus,
    UserCircle,
    CheckCircle,
    ClipboardText,
    Check,
    Desktop,
    Upload,
    DeviceMobile,
    QrCode,
    Info,
    Lightbulb,
    Gear,
    Brain,
    X,
    Play,
    Stop,
    VideoCamera,
    Microphone
} from '@phosphor-icons/react';

export function AvatarPlatform() {
    const [isMockingUpload, setIsMockingUpload] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState<any>(null);
    const [editorText, setEditorText] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isWebcamOpen, setIsWebcamOpen] = useState(false);
    const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
    const [isRecording, setIsRecording] = useState(false);

    const webcamRef = useRef<Webcam>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const progressRef = useRef<HTMLDivElement>(null);

    const steps = [
        { id: 1, name: 'Subida', icon: <Upload size={20} /> },
        { id: 2, name: 'Procesando', icon: <Gear size={20} /> },
        { id: 3, name: 'IA Analizando', icon: <Brain size={20} /> },
        { id: 4, name: 'Completado', icon: <CheckCircle size={20} /> }
    ];

    useEffect(() => {
        if (isMockingUpload && currentStep > 0) {
            progressRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [isMockingUpload, currentStep]);

    const simulateUpload = () => {
        setIsMockingUpload(true);
        setUploadProgress(0);
        setCurrentStep(1);

        let progress = 0;
        const interval = setInterval(() => {
            progress += 1;
            setUploadProgress(progress);

            if (progress >= 25) setCurrentStep(2);
            if (progress >= 50) setCurrentStep(3);
            if (progress >= 75) setCurrentStep(4);

            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    alert('¡Procesamiento completado! Tu avatar se ha creado exitosamente.');
                }, 500);
            }
        }, 50);
    };

    // Text to Speech Functionality
    const handleSpeak = () => {
        if (!editorText) return;

        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        const utterance = new SpeechSynthesisUtterance(editorText);
        utterance.lang = 'es-ES'; // Default to Spanish
        utterance.onend = () => setIsSpeaking(false);
        setIsSpeaking(true);
        window.speechSynthesis.speak(utterance);
    };

    // Webcam Recording
    const handleStartRecording = useCallback(() => {
        setIsRecording(true);
        setRecordedChunks([]);

        const stream = webcamRef.current?.video?.srcObject as MediaStream;
        if (stream) {
            mediaRecorderRef.current = new MediaRecorder(stream, {
                mimeType: "video/webm"
            });
            mediaRecorderRef.current.addEventListener(
                "dataavailable",
                (event: BlobEvent) => {
                    if (event.data.size > 0) {
                        setRecordedChunks((prev) => [...prev, event.data]);
                    }
                }
            );
            mediaRecorderRef.current.start();
        } else {
            console.error("No stream found from webcam");
            setIsRecording(false);
        }
    }, [webcamRef]);

    const handleStopRecording = useCallback(() => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
    }, [mediaRecorderRef]);

    const handleDownload = useCallback(() => {
        if (recordedChunks.length) {
            const blob = new Blob(recordedChunks, {
                type: "video/webm"
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            document.body.appendChild(a);
            a.style.display = "none";
            a.href = url;
            a.download = "mi-grabacion-nexa.webm";
            a.click();
            window.URL.revokeObjectURL(url);
            setRecordedChunks([]);
        }
    }, [recordedChunks]);

    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.logo}>
                    <Robot className={styles.logoIcon} size={32} />
                    <span>NEXA AI Avatar</span>
                </div>
                <div className={styles.userActions}>
                    <button className={`${styles.btn} ${styles.btnOutline}`}>
                        <User size={20} /> Mi Cuenta
                    </button>
                    <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => setSelectedAvatar(null)}>
                        <Plus size={20} /> Nuevo Avatar
                    </button>
                </div>
            </header>

            <AnimatePresence mode="wait">
                {selectedAvatar ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={styles.editorContainer}
                        key="editor"
                    >
                        <div className={styles.editorHeader}>
                            <button className={styles.backButton} onClick={() => setSelectedAvatar(null)}>
                                ← Volver a la galería
                            </button>
                            <h2>Editor de Studio: {selectedAvatar.name}</h2>
                        </div>

                        <div className={styles.editorLayout}>
                            <div className={styles.previewArea}>
                                <div className={styles.mockVideoPlayer}>
                                    <img
                                        src={selectedAvatar.image}
                                        alt={selectedAvatar.name}
                                        className={`${styles.avatarPreviewImage} ${isSpeaking ? styles.pulseAnimation : ''}`}
                                    />
                                    {isSpeaking && <div className={styles.speakingIndicator}>Variables de voz activas...</div>}
                                </div>
                            </div>

                            <div className={styles.controlsArea}>
                                <h3>Guion de Texto a Voz</h3>
                                <textarea
                                    className={styles.scriptInput}
                                    placeholder="Escribe aquí lo que quieres que diga tu avatar..."
                                    value={editorText}
                                    onChange={(e) => setEditorText(e.target.value)}
                                />

                                <div className={styles.editorActions}>
                                    <button
                                        className={`${styles.btn} ${isSpeaking ? styles.btnStop : styles.btnPlay}`}
                                        onClick={handleSpeak}
                                    >
                                        {isSpeaking ? <Stop size={20} /> : <Play size={20} />}
                                        {isSpeaking ? ' Detener Voz' : ' Probar Voz'}
                                    </button>

                                    <button
                                        className={`${styles.btn} ${styles.btnPrimary}`}
                                        onClick={simulateUpload}
                                        disabled={!editorText || isMockingUpload}
                                    >
                                        <VideoCamera size={20} />
                                        {isMockingUpload ? ' Procesando...' : ' Generar Video (Holograma)'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key="gallery"
                    >
                        {/* Avatar Library */}
                        <h2 className={styles.sectionTitle}>
                            <UserCircle size={32} style={{ marginRight: '10px' }} /> Biblioteca de Avatares (Hologramas)
                        </h2>

                        <div className={styles.avatarGrid}>
                            {avatars.map((avatar) => (
                                <motion.div
                                    key={avatar.id}
                                    className={styles.avatarCard}
                                    whileHover={{ y: -8, boxShadow: '0 15px 30px rgba(0,0,0,0.12)' }}
                                >
                                    <div style={{ height: '300px', overflow: 'hidden', position: 'relative' }}>
                                        <img
                                            src={avatar.image}
                                            alt={avatar.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>
                                    <div className={styles.cardHeader}>
                                        <h3 className={styles.cardTitle}>{avatar.name}</h3>
                                        <span className={`${styles.cardBadge} ${styles.badgePro}`}>{avatar.category}</span>
                                    </div>
                                    <div className={styles.cardFooter}>
                                        <button className={`${styles.btn} ${styles.btnPrimary} ${styles.btnCard}`} onClick={() => setSelectedAvatar(avatar)}>
                                            Crear Video con {avatar.name}
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Upload Section */}
                        <div className={styles.uploadSection}>
                            <div className={styles.uploadHeader}>
                                <h2 className={styles.uploadTitle}>Captura y carga un video de discurso</h2>
                                <p className={styles.uploadSubtitle}>Sigue estos requisitos para obtener los mejores resultados</p>
                            </div>
                            <div className={styles.uploadBody}>
                                {isWebcamOpen ? (
                                    <div className={styles.webcamContainer}>
                                        <Webcam
                                            audio={true}
                                            ref={webcamRef}
                                            screenshotFormat="image/jpeg"
                                            className={styles.webcamVideo}
                                        />
                                        <div className={styles.webcamControls}>
                                            {isRecording ? (
                                                <button className={`${styles.btn} ${styles.btnStop}`} onClick={handleStopRecording}>
                                                    <Stop size={20} /> Detener Grabación
                                                </button>
                                            ) : (
                                                <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleStartRecording}>
                                                    <div className={styles.recordDot}></div> Iniciar Grabación
                                                </button>
                                            )}
                                            <button className={`${styles.btn} ${styles.btnOutline}`} onClick={() => setIsWebcamOpen(false)}>
                                                Cancelar
                                            </button>
                                            {recordedChunks.length > 0 && (
                                                <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleDownload}>
                                                    Descargar Grabación
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className={styles.requirements}>
                                            <h3 className={styles.requirementsTitle}>
                                                <ClipboardText size={24} style={{ marginRight: '10px' }} /> Requisitos para el video
                                            </h3>
                                            <ul className={styles.requirementsList}>
                                                <li><Check size={16} /> <span><strong>Entorno tranquilo:</strong> Iluminación brillante y estable.</span></li>
                                                <li><Check size={16} /> <span><strong>Calidad HD:</strong> Usa una cámara profesional o un teléfono móvil.</span></li>
                                            </ul>
                                        </div>

                                        <div className={styles.uploadOptions}>
                                            <div className={styles.uploadOption} onClick={() => setIsWebcamOpen(true)}>
                                                <div className={styles.uploadIcon}>
                                                    <VideoCamera size={48} />
                                                </div>
                                                <h3 className={styles.uploadOptionTitle}>Grabar con Webcam</h3>
                                                <p className={styles.uploadOptionDescription}>Graba directamente desde tu navegador.</p>
                                                <button className={styles.btnUpload}>
                                                    <VideoCamera size={18} /> Iniciar Cámara
                                                </button>
                                            </div>

                                            <div className={styles.uploadOption} onClick={() => setIsModalOpen(true)}>
                                                <div className={styles.uploadIcon}>
                                                    <DeviceMobile size={48} />
                                                </div>
                                                <h3 className={styles.uploadOptionTitle}>Subir desde el teléfono móvil</h3>
                                                <p className={styles.uploadOptionDescription}>Escanea el código QR con tu teléfono para subir el video</p>
                                                <button className={styles.btnUpload}>
                                                    <QrCode size={18} /> Mostrar Código QR
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Progress Section */}
            {isMockingUpload && (
                <div ref={progressRef} className={`${styles.progressSection} ${styles.progressSectionActive}`}>
                    <div className={styles.progressHeader}>
                        <h3 className={styles.progressTitle}>Procesando tu video</h3>
                        <div className={styles.progressPercentage}>{uploadProgress}%</div>
                    </div>
                    <div className={styles.progressBar}>
                        <div className={styles.progressFill} style={{ width: `${uploadProgress}%` }}></div>
                    </div>

                    <div className={styles.progressSteps}>
                        {steps.map((step, index) => {
                            let statusClass = '';
                            if (index + 1 < currentStep) statusClass = styles.progressStepCompleted;
                            else if (index + 1 === currentStep) statusClass = styles.progressStepActive;

                            return (
                                <div key={step.id} className={`${styles.progressStep} ${statusClass}`}>
                                    <div className={styles.stepIcon}>
                                        {step.icon}
                                    </div>
                                    <div className={styles.stepName}>{step.name}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className={styles.footer}>
                <div className={styles.footerLinks}>
                    <a href="#">Términos de Servicio</a>
                    <a href="#">Política de Privacidad</a>
                    <a href="#">Ayuda</a>
                </div>
                <p>&copy; 2026 NEXA AI. Todos los derechos reservados.</p>
            </footer>

            {/* Modal */}
            {isModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>Subir desde tu móvil</h3>
                            <button className={styles.modalClose} onClick={() => setIsModalOpen(false)}>&times;</button>
                        </div>
                        <div className={styles.modalBody}>
                            <p className={styles.modalText}>Escanea este código QR con la cámara de tu teléfono para subir el video directamente desde tu dispositivo móvil.</p>

                            <div className={styles.qrcodeContainer}>
                                <div className={styles.qrcode}>
                                    <QrCode size={100} />
                                </div>
                                <p>QR Code para subida móvil</p>
                            </div>

                            <p className={styles.modalText}>También puedes acceder desde: <strong>nexa.ai/upload</strong></p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
