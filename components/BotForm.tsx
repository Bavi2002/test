'use client'

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { UploadPreview } from "./UploadPreview"
import Tagify from "@yaireo/tagify"
import '@yaireo/tagify/dist/tagify.css'

const formSchema = z.object({
  botName: z.string().min(2, "Bot name must be at least 2 characters"),
  description: z.string().min(12, "Description must be at least 12 characters").max(200, "Description must be less than 30 characters"),
  category: z.string().nonempty("Category is required"),
  demoVideoLink: z.string().nonempty("Demo video link is required"),
  botLogo: z.instanceof(File, { message: "Bot logo is required" }),
  qrCode: z.instanceof(File, { message: "QR code is required" }),
  tags: z.array(z.string()).optional(),
})

type FormData = z.infer<typeof formSchema>

function extractYouTubeVideoId(url: string): string | null {
  const match = url.match(
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )
  return match ? match[1] : null
}

export default function BotForm() {
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [qrPreview, setQrPreview] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      botName: "",
      description: "",
      category: "",
      demoVideoLink: "",
      botLogo: undefined,
      qrCode: undefined,
      tags: [],
    },
  })

  const demoVideoLink = watch("demoVideoLink")
  const youtubeVideoId = extractYouTubeVideoId(demoVideoLink || "")

  useEffect(() => {
    const tagInput = document.querySelector('input[name=tags]') as HTMLInputElement
    if (tagInput) {
      const tagify = new Tagify(tagInput)

      tagify.on('change', (e) => {
        const tags = e.detail.value ? JSON.parse(e.detail.value).map((item: { value: string }) => item.value) : []
        setValue("tags", tags, { shouldValidate: true });
      })

      return () => {
        tagify.destroy()
      }
    }
  }, [])

  const onSubmit = async (data: FormData) => {
    try {
      const formData = new FormData()
      formData.append("botLogo", data.botLogo)
      formData.append("qrCode", data.qrCode)

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
      const uploadResult = await uploadResponse.json()

      if (uploadResponse.ok) {
        const { botLogoUrl, qrCodeUrl } = uploadResult
        const botData = {
          botName: data.botName.trim(),
          description: data.description.trim(),
          category: data.category,
          demoVideoLink: data.demoVideoLink.trim(),
          botLogoUrl,
          qrCodeUrl,
          tags: data.tags || [],
        }

        console.log("Bot data to be sent:", botData)

        const createBotResponse = await fetch("/api/test", {
          method: "POST",
          body: JSON.stringify(botData),
          headers: {
            "Content-Type": "application/json",
          },
        })

        console.log("Create bot response:", createBotResponse)

        const createBotResult = await createBotResponse.json()
        if (createBotResponse.ok) {
          alert("Bot successfully created!")
        } else {
          console.error(createBotResult)
          alert("Error creating bot!")
        }
      } else {
        alert("Error uploading files!")
      }
      resetForm()
    } catch (error) {
      console.error(error)
      alert("Error creating bot!")
    }
  }

  const resetForm = () => {
    reset()
    setLogoPreview(null)
    setQrPreview(null)
    const tagInput = document.querySelector('input[name=tags]') as HTMLInputElement
    if (tagInput) {
      const tagify = new Tagify(tagInput)
      tagify.removeAllTags()
    }
  }

  const handleLogoChange = (file: File | null) => {
    setValue("botLogo", file as File, { shouldValidate: true })
    if (file) {
      setLogoPreview(URL.createObjectURL(file))
    }
  }

  const handleQrChange = (file: File | null) => {
    setValue("qrCode", file as File, { shouldValidate: true })
    if (file) {
      setQrPreview(URL.createObjectURL(file))
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-5xl mx-auto p-6 space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="botName">Bot Name</Label>
          <Input
            id="botName"
            {...register("botName")}
            placeholder="Bot Name"
            className="md:basis-2/3 pr-5"
          />
          {errors.botName && <p className="text-sm text-red-500">{errors.botName.message}</p>}
        </div>

        <div className="md:basis-1/3">
          <Label>Category</Label>
          <Select onValueChange={(val) => setValue("category", val, { shouldValidate: true })}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Education">Education</SelectItem>
              <SelectItem value="Food">Food</SelectItem>
              <SelectItem value="Restaurant">Restaurant</SelectItem>
            </SelectContent>
          </Select>
          {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Description"
          className="w-full h-24 px-4 py-2 text-base"
        />
        {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
      </div>

      <div>
        <Label htmlFor="tags">Tags</Label>
        <input
          id="tags"
          name="tags"
          placeholder="Add tags"
          className="w-full h-10 px-4 text-base border rounded-md"
        />
        {errors.tags && <p className="text-sm text-red-500">{errors.tags.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UploadPreview
          label="Upload Bot Logo"
          fileUrl={logoPreview}
          onFileChange={handleLogoChange}
          fileError={errors.botLogo?.message}
        />

        <UploadPreview
          label="Upload QR Code"
          fileUrl={qrPreview}
          onFileChange={handleQrChange}
          fileError={errors.qrCode?.message}
        />
      </div>

      <div>
        <Label htmlFor="demoVideoLink">Demo Video Link</Label>
        <Input
          id="demoVideoLink"
          {...register("demoVideoLink")}
          placeholder="https://www.youtube.com/watch?v=..."
          className="h-10 px-4 text-base"
        />
        {errors.demoVideoLink && (
          <p className="text-sm text-red-500">{errors.demoVideoLink.message}</p>
        )}
      </div>

      <div>
        <UploadPreview
          label="Video Preview"
          isVideo
          videoId={youtubeVideoId}
        />
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={resetForm}>
          Cancel
        </Button>
        <Button type="submit">
          Submit
        </Button>
      </div>
    </form>
  )
}