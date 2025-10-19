import { storage } from "@/lib/firebase"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"

export interface UploadOptions {
  maxSizeInMB?: number
  allowedTypes?: string[]
}

const DEFAULT_OPTIONS: UploadOptions = {
  maxSizeInMB: 5,
  allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
}

export async function uploadAvatar(userId: string, file: File, options: UploadOptions = {}): Promise<string> {
  const finalOptions = { ...DEFAULT_OPTIONS, ...options }

  // Validate file size
  const maxSizeInBytes = (finalOptions.maxSizeInMB || 5) * 1024 * 1024
  if (file.size > maxSizeInBytes) {
    throw new Error(`File size must be less than ${finalOptions.maxSizeInMB}MB`)
  }

  // Validate file type
  if (finalOptions.allowedTypes && !finalOptions.allowedTypes.includes(file.type)) {
    throw new Error("Invalid file type. Please upload an image file.")
  }

  try {
    // Create a unique filename with timestamp
    const timestamp = Date.now()
    const filename = `${userId}_${timestamp}`
    const storageRef = ref(storage, `avatars/${userId}/${filename}`)

    // Upload file
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type,
      customMetadata: {
        uploadedAt: new Date().toISOString(),
        originalName: file.name,
      },
    })

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref)

    return downloadURL
  } catch (error) {
    console.error("Error uploading avatar:", error)
    throw error
  }
}

export async function deleteAvatar(userId: string, avatarPath: string): Promise<void> {
  try {
    const storageRef = ref(storage, avatarPath)
    await deleteObject(storageRef)
  } catch (error) {
    console.error("Error deleting avatar:", error)
    // Don't throw - deletion failure shouldn't block other operations
  }
}

export async function deleteOldAvatars(userId: string): Promise<void> {
  try {
    // This would require Firebase Admin SDK for listing files
    // For now, we'll just keep the latest avatar
    // In production, implement a cleanup function using Cloud Functions
  } catch (error) {
    console.error("Error cleaning up old avatars:", error)
  }
}

export function getAvatarInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function compressImage(file: File, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      const img = new Image()

      img.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        if (!ctx) {
          reject(new Error("Could not get canvas context"))
          return
        }

        // Set canvas size to image size
        canvas.width = img.width
        canvas.height = img.height

        // Draw image on canvas
        ctx.drawImage(img, 0, 0)

        // Convert to blob with compression
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error("Could not compress image"))
            }
          },
          "image/jpeg",
          quality,
        )
      }

      img.onerror = () => reject(new Error("Could not load image"))
      img.src = event.target?.result as string
    }

    reader.onerror = () => reject(new Error("Could not read file"))
    reader.readAsDataURL(file)
  })
}
