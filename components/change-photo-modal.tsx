'use client'

import { useState, useRef, useCallback, lazy, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Camera, Upload, X, ZoomIn, ZoomOut } from 'lucide-react'
import Image from 'next/image'
import type { Area, Point } from 'react-easy-crop'

const Cropper = lazy(() => import('react-easy-crop'))

interface ChangePhotoModalProps {
  isOpen: boolean
  onClose: () => void
  currentAvatar?: string | null
  onUpload: (file: File) => Promise<void>
}

export function ChangePhotoModal({
  isOpen,
  onClose,
  currentAvatar,
  onUpload,
}: ChangePhotoModalProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [showCropper, setShowCropper] = useState(false)
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [croppedPreview, setCroppedPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleOnCropComplete = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels)
    },
    []
  )

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new window.Image()
      image.addEventListener('load', () => resolve(image))
      image.addEventListener('error', (err) => reject(err))
      image.setAttribute('crossOrigin', 'anonymous')
      image.src = url
    })

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area
  ): Promise<string> => {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) throw new Error('Could not get canvas context')

    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    )

    return canvas.toDataURL('image/jpeg')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }

      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
        setCroppedPreview(null)
        setShowCropper(true)
        setCrop({ x: 0, y: 0 })
        setZoom(1)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleApplyCrop = async () => {
    if (!preview || !croppedAreaPixels) return
    try {
      const cropped = await getCroppedImg(preview, croppedAreaPixels)
      setCroppedPreview(cropped)
      setShowCropper(false)
    } catch (error) {
      console.error('[v0] Error cropping image:', error)
      alert('Failed to crop image')
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      const event = {
        target: { files: e.dataTransfer.files },
      } as unknown as React.ChangeEvent<HTMLInputElement>
      handleFileChange(event)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !croppedPreview) return

    setLoading(true)
    try {
      // Convert cropped image to file
      const response = await fetch(croppedPreview)
      const blob = await response.blob()
      const croppedFile = new File(
        [blob],
        selectedFile.name,
        { type: 'image/jpeg' }
      )

      await onUpload(croppedFile)
      setPreview(null)
      setSelectedFile(null)
      setCroppedPreview(null)
      setShowCropper(false)
      onClose()
    } catch (error) {
      console.error('[v0] Error uploading photo:', error)
      alert('Failed to upload photo')
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setPreview(null)
    setSelectedFile(null)
    setCroppedPreview(null)
    setShowCropper(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="size-5" />
            Change Photo
          </DialogTitle>
          <DialogDescription>
            Upload a new profile photo. Image should be at least 400x400px.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Avatar Display */}
          {currentAvatar && !preview && (
            <div className="flex justify-center">
              <div className="relative size-32 rounded-full overflow-hidden border border-border">
                <Image
                  src={currentAvatar}
                  alt="Current avatar"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}

          {/* Cropper */}
          {showCropper && preview && (
            <div className="space-y-3">
              <div className="relative w-full bg-background rounded-lg overflow-hidden" style={{ height: '300px' }}>
                <Suspense fallback={<div className="w-full h-full flex items-center justify-center bg-muted">Loading cropper...</div>}>
                  <Cropper
                    image={preview}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    cropShape="round"
                    showGrid={false}
                    onCropChange={setCrop}
                    onCropAreaChange={handleOnCropComplete}
                    onZoomChange={setZoom}
                  />
                </Suspense>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setZoom(Math.max(1, zoom - 0.1))}
                >
                  <ZoomOut className="size-4" />
                </Button>
                <span className="text-sm text-muted-foreground w-12 text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                >
                  <ZoomIn className="size-4" />
                </Button>
              </div>

              {/* Preview of Circular Avatar */}
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm text-muted-foreground">Preview</p>
                <div className="relative size-24 rounded-full overflow-hidden border-2 border-primary shadow-md">
                  {croppedAreaPixels && (
                    <div
                      className="absolute w-full h-full"
                      style={{
                        backgroundImage: `url(${preview})`,
                        backgroundPosition: `${-croppedAreaPixels.x}px ${-croppedAreaPixels.y}px`,
                        backgroundSize: `${preview ? '100%' : 'auto'}`,
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Cropped Preview Before Upload */}
          {croppedPreview && !showCropper && (
            <div className="flex flex-col items-center gap-3">
              <p className="text-sm text-muted-foreground">How it will appear</p>
              <div className="relative size-32 rounded-full overflow-hidden border-2 border-primary shadow-md">
                <img
                  src={croppedPreview}
                  alt="Cropped preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowCropper(true)}
              >
                Edit Crop
              </Button>
            </div>
          )}

          {/* Upload Area */}
          {!preview && (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <Upload className="mx-auto size-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Click to upload or drag and drop</p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, GIF up to 5MB
              </p>
            </div>
          )}

          {/* Info Text */}
          {!preview && (
            <p className="text-xs text-muted-foreground text-center">
              Recommended size: 400x400px or larger
            </p>
          )}
        </div>

        <DialogFooter className="gap-2">
          {showCropper && preview && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleClear}
                disabled={loading}
              >
                <X className="size-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleApplyCrop}
                disabled={loading}
              >
                Apply Crop
              </Button>
            </>
          )}
          {!showCropper && (
            <>
              {(preview || croppedPreview) && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClear}
                  disabled={loading}
                >
                  <X className="size-4 mr-2" />
                  Clear
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleUpload}
                disabled={!croppedPreview || loading}
              >
                {loading ? 'Uploading...' : 'Upload Photo'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
