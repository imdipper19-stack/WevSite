
import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { Button } from './Button'
import { Card } from './Card'

interface ImageCropperProps {
    imageSrc: string
    onCropComplete: (croppedArea: any, croppedAreaPixels: any) => void
    onCancel: () => void
    onSave: () => void
    isLoading?: boolean
}

export function ImageCropper({ imageSrc, onCropComplete, onCancel, onSave, isLoading }: ImageCropperProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="bg-[var(--card-bg)] w-full max-w-md rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-[var(--border)]">
                    <h3 className="text-lg font-bold">Редактирование фото</h3>
                </div>

                <div className="relative h-[400px] w-full bg-black">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        onCropChange={setCrop}
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}
                        cropShape="round"
                        showGrid={false}
                    />
                </div>

                <div className="p-4 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Масштаб</label>
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-full h-2 bg-[var(--border)] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
                        />
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="secondary"
                            fullWidth
                            onClick={onCancel}
                            disabled={isLoading}
                        >
                            Отмена
                        </Button>
                        <Button
                            variant="primary"
                            fullWidth
                            onClick={onSave}
                            isLoading={isLoading}
                        >
                            Сохранить
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
