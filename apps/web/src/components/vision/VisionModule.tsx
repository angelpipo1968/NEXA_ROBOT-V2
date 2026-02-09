'use client'

import { useState, useRef, useCallback } from 'react'
import Webcam from 'react-webcam'
import { createWorker } from 'tesseract.js'
import { Upload, Camera, X, RefreshCw, Copy, Check, ScanLine, FileText, Sparkles, AlertCircle } from 'lucide-react'
import { useChatStore } from '@/store/useChatStore'

export function VisionModule() {
    const { setActiveModule, addMessage } = useChatStore()
    const [image, setImage] = useState<string | null>(null)
    const [isScanning, setIsScanning] = useState(false)
    const [result, setResult] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isCameraOpen, setIsCameraOpen] = useState(false)
    const [progress, setProgress] = useState(0)
    const [copied, setCopied] = useState(false)

    const webcamRef = useRef<Webcam>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setImage(reader.result as string)
                setResult(null)
                setError(null)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleCapture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot()
        if (imageSrc) {
            setImage(imageSrc)
            setIsCameraOpen(false)
            setResult(null)
            setError(null)
        }
    }, [webcamRef])

    const handleScan = async () => {
        if (!image) return

        setIsScanning(true)
        setProgress(0)
        setError(null)
        setResult(null)

        try {
            const worker = await createWorker('eng', 1, {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        setProgress(Math.floor(m.progress * 100))
                    }
                },
            })

            const { data: { text } } = await worker.recognize(image)
            await worker.terminate()

            setResult(text)
        } catch (err) {
            console.error(err)
            setError('Error scanning image. Please try again.')
        } finally {
            setIsScanning(false)
        }
    }

    const handleCopy = () => {
        if (result) {
            navigator.clipboard.writeText(result)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const handleSendToChat = () => {
        if (result) {
            addMessage({
                id: Date.now().toString(),
                role: 'user',
                content: `I scanned this code/text:\n\n\`\`\`\n${result}\n\`\`\`\n\nCan you analyze it?`,
                timestamp: Date.now()
            })
            setActiveModule('chat')
        }
    }

    const reset = () => {
        setImage(null)
        setResult(null)
        setError(null)
        setProgress(0)
    }

    return (
        <div className="h-full flex flex-col bg-[#05060a] text-white p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto w-full flex flex-col gap-8">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 flex items-center gap-3">
                            <ScanLine className="text-blue-400" />
                            Nexa Vision
                        </h1>
                        <p className="text-gray-400 mt-2">
                            Advanced OCR & Code Scanning System
                        </p>
                    </div>
                    <button
                        onClick={() => setActiveModule('chat')}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X size={24} className="text-gray-400" />
                    </button>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Left Column: Input */}
                    <div className="flex flex-col gap-4">
                        <div className={`
              aspect-video rounded-2xl border-2 border-dashed border-white/10 bg-white/5 
              flex flex-col items-center justify-center relative overflow-hidden group transition-all
              ${!image && !isCameraOpen ? 'hover:border-blue-500/50 hover:bg-white/10 cursor-pointer' : ''}
            `}
                            onClick={() => !image && !isCameraOpen && fileInputRef.current?.click()}
                        >
                            {isCameraOpen ? (
                                <>
                                    <Webcam
                                        audio={false}
                                        ref={webcamRef}
                                        screenshotFormat="image/jpeg"
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleCapture()
                                        }}
                                        className="absolute bottom-4 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full border-4 border-white bg-red-500 hover:bg-red-600 transition-colors shadow-lg"
                                    />
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setIsCameraOpen(false)
                                        }}
                                        className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70"
                                    >
                                        <X size={20} />
                                    </button>
                                </>
                            ) : image ? (
                                <>
                                    <img src={image} alt="Preview" className="w-full h-full object-contain" />
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            reset()
                                        }}
                                        className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={20} />
                                    </button>
                                </>
                            ) : (
                                <div className="text-center p-6">
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                        <Upload className="text-gray-400 group-hover:text-blue-400" size={32} />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-200 mb-1">Upload Image</h3>
                                    <p className="text-sm text-gray-400 mb-6">Drag & drop or click to browse</p>

                                    <div className="flex gap-3 justify-center">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                fileInputRef.current?.click()
                                            }}
                                            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            Browse Files
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setIsCameraOpen(true)
                                            }}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                        >
                                            <Camera size={16} />
                                            Open Camera
                                        </button>
                                    </div>
                                </div>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileUpload}
                            />
                        </div>

                        {image && !isScanning && !result && (
                            <button
                                onClick={handleScan}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold hover:brightness-110 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] flex items-center justify-center gap-2"
                            >
                                <ScanLine size={20} />
                                Start Scan
                            </button>
                        )}

                        {isScanning && (
                            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                                <div className="flex items-center gap-3 mb-4">
                                    <RefreshCw className="animate-spin text-blue-400" size={20} />
                                    <span className="font-medium text-gray-200">Processing Image...</span>
                                    <span className="ml-auto text-blue-400 font-mono">{progress}%</span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 transition-all duration-300 ease-out"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3">
                                <AlertCircle size={20} />
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Results */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col h-[500px]">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-200 flex items-center gap-2">
                                <FileText size={18} className="text-gray-400" />
                                Scan Results
                            </h3>
                            {result && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleCopy}
                                        className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                        title="Copy to clipboard"
                                    >
                                        {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                                    </button>
                                    <button
                                        onClick={handleSendToChat}
                                        className="px-3 py-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                    >
                                        <Sparkles size={14} />
                                        Analyze in Chat
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 bg-black/40 rounded-xl p-4 overflow-y-auto font-mono text-sm text-gray-300 border border-white/5">
                            {result ? (
                                <pre className="whitespace-pre-wrap break-words">{result}</pre>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-3 opacity-50">
                                    <ScanLine size={48} strokeWidth={1} />
                                    <p>No text scanned yet</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
