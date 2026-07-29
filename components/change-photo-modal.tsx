'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Camera, Upload, X } from 'lucide-react'
import Image from 'next/image'

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
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      }
      reader.readAsDataURL(file)
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
    if (!selectedFile) return

    setLoading(true)
    try {
      await onUpload(selectedFile)
      setPreview(null)
      setSelectedFile(null)
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
              <div className="relative size-32 rounded-lg overflow-hidden border border-border">
                <Image
                  src={currentAvatar}
                  alt="Current avatar"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}

          {/* Preview */}
          {preview && (
            <div className="flex justify-center">
              <div className="relative size-32 rounded-lg overflow-hidden border-2 border-primary">
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}

          {/* Upload Area */}
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

          {/* Info Text */}
          {!preview && (
            <p className="text-xs text-muted-foreground text-center">
              Recommended size: 400x400px or larger
            </p>
          )}
        </div>

        <DialogFooter className="gap-2">
          {preview && (
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
            disabled={!selectedFile || loading}
          >
            {loading ? 'Uploading...' : 'Upload Photo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
