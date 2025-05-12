'use client'

import { Input } from "@/components/ui/input"
import Image from "next/image"
import { useRef } from "react"

type Props = {
  label: string
  fileUrl?: string | null
  onFileChange?: (file: File | null) => void
  fileError?: string
  isVideo?: boolean
  videoId?: string | null
}

export function UploadPreview({
  label,
  fileUrl,
  onFileChange,
  fileError,
  isVideo = false,
  videoId,
}: Props) {
  const fileInput = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onFileChange) {
      const reader = new FileReader()
      reader.onloadend = () => {
        onFileChange(file)
      }
      reader.readAsDataURL(file)
    } else {
      onFileChange?.(null)
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>

      {isVideo ? (
        videoId ? (
          <div className="aspect-video mt-2 border rounded overflow-hidden w-full md:max-xl:flex">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video preview"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        ) : null
      ) : (
        <>
          <Input ref={fileInput} type="file" accept="image/*" onChange={handleChange} />
          {fileError && <p className="text-sm text-red-500">{fileError}</p>}
          {fileUrl && (
            <div className="mt-2 w-20 h-20 border bg-muted flex items-center justify-center overflow-hidden">
              <Image src={fileUrl} alt={label} width={80} height={80} />
            </div>
          )}
        </>
      )}
    </div>
  )
}
