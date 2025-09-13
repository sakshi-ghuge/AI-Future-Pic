import React, { useRef, useEffect, useState } from 'react';
import { CameraIcon } from './icons';
import { useTranslations } from '../contexts/SettingsContext';

interface CameraCaptureProps {
    onCapture: (file: File) => void;
    onCancel: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onCancel }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);
    const t = useTranslations();

    useEffect(() => {
        const getCameraStream = async () => {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
                setStream(mediaStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                setError(t('cameraError'));
            }
        };

        getCameraStream();

        return () => {
            stream?.getTracks().forEach(track => track.stop());
        };
    }, [t]);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                canvas.toBlob((blob) => {
                    if (blob) {
                        const file = new File([blob], 'capture.png', { type: 'image/png' });
                        onCapture(file);
                    }
                }, 'image/png');
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-700 w-full max-w-2xl">
                <h2 className="text-2xl font-bold text-center mb-4">{t('cameraTitle')}</h2>
                {error ? (
                    <div className="text-center text-red-400 p-4">{error}</div>
                ) : (
                    <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg aspect-video bg-black"></video>
                )}
                <canvas ref={canvasRef} className="hidden"></canvas>
                <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
                    <button
                        onClick={handleCapture}
                        disabled={!!error}
                        className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-sky-400 to-blue-500 text-white font-bold rounded-lg shadow-lg hover:shadow-blue-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <CameraIcon />
                        {t('takePhoto')}
                    </button>
                     <button
                        onClick={onCancel}
                        className="w-full sm:w-auto px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors"
                    >
                        {t('cancel')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CameraCapture;