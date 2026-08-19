'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { toast } from 'sonner'
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

const Cropper = dynamic(() => import('react-easy-crop'), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-muted">Loading cropper...</div>,
})

interface ChangePhotoModalProps {
  isOpen: boolean
  onClose: () => void
  currentAvatar?: string | null
  onUpload: (file: File) => Promise<void>
}

const PREVIEW_SIZE = 120

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
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)

  const handleOnCropComplete = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels)
    },
    []
  )

  // Update canvas preview whenever crop changes
  useEffect(() => {
    if (!preview || !croppedAreaPixels || !showCropper) return

    const updatePreview = async () => {
      const canvas = previewCanvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      try {
        const img = new window.Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          // Clear canvas
          ctx.fillStyle = '#fff'
          ctx.fillRect(0, 0, canvas.width, canvas.height)

          // Draw circular clipping
          ctx.beginPath()
          ctx.arc(PREVIEW_SIZE / 2, PREVIEW_SIZE / 2, PREVIEW_SIZE / 2, 0, Math.PI * 2)
          ctx.clip()

          // Draw the cropped image
          const scale = img.width / croppedAreaPixels.width
          ctx.drawImage(
            img,
            croppedAreaPixels.x,
            croppedAreaPixels.y,
            croppedAreaPixels.width,
            croppedAreaPixels.height,
            0,
            0,
            PREVIEW_SIZE,
            PREVIEW_SIZE
          )
        }
        img.src = preview
      } catch (error) {
      }
    }

    updatePreview()
  }, [preview, croppedAreaPixels, showCropper])

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
      toast.error('Please select an image file')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
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
      toast.error('Failed to crop image')
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
      toast.error('Failed to upload photo. Please try again.')
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

  // Reset state when modal closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Clear all state when closing
      setPreview(null)
      setSelectedFile(null)
      setCroppedPreview(null)
      setShowCropper(false)
      setCrop({ x: 0, y: 0 })
      setZoom(1)
      setCroppedAreaPixels(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className={showCropper && preview ? 'sm:max-w-2xl' : 'sm:max-w-md'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="size-5" />
            Change Photo
          </DialogTitle>
          <DialogDescription>
            Upload and crop your profile photo for a circular avatar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Avatar Display */}
          {currentAvatar && !preview && (
            <div className="flex justify-center">
              <div className="relative size-32 rounded-full overflow-hidden border-2 border-border shadow-lg">
                <Image
                  src={currentAvatar}
                  alt="Current avatar"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}

          {/* Cropper - Side by Side Layout */}
          {showCropper && preview && (
            <div className="grid grid-cols-2 gap-4">
              {/* Cropper on Left */}
              <div className="space-y-3">
                <div className="relative w-full bg-background rounded-lg overflow-hidden border border-border" style={{ height: '280px' }}>
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
              </div>

              {/* Preview on Right */}
              <div className="flex flex-col items-center justify-center gap-3 p-4 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Preview</p>
                <canvas
                  ref={previewCanvasRef}
                  width={PREVIEW_SIZE}
                  height={PREVIEW_SIZE}
                  className="rounded-full border-2 border-primary shadow-md"
                  style={{ display: 'block' }}
                />
                <p className="text-xs text-muted-foreground text-center">
                  How your avatar will appear
                </p>
              </div>
            </div>
          )}

          {/* Cropped Preview Before Upload */}
          {croppedPreview && !showCropper && (
            <div className="flex flex-col items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">How it will appear</p>
              <img
                src={croppedPreview}
                alt="Cropped preview"
                className="w-32 h-32 rounded-full border-2 border-primary shadow-md object-cover"
              />
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

          {/* Upload Area - Casual Design */}
          {!preview && (
            <div className="space-y-4">
              {/* Upload Button Area - Casual Style */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="relative rounded-xl p-6 text-center cursor-pointer transition-all group bg-gradient-to-br from-primary/5 to-transparent border border-primary/20 hover:border-primary/40 hover:from-primary/10"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center justify-center size-14 rounded-full bg-primary/15 group-hover:bg-primary/25 transition-all">
                    <Camera className="size-7 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Upload new photo</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      or drag and drop
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground pt-2">
                    PNG, JPG • up to 5MB
                  </p>
                </div>
              </div>
            </div>
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
