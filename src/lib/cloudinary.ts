import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export { cloudinary }

// Upload image from base64 or URL
export async function uploadImage(
  file: string, // base64 string or URL
  options?: {
    folder?: string
    publicId?: string
    transformation?: object
  }
): Promise<{ url: string | null; publicId: string | null; error: string | null }> {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: options?.folder || 'gotera',
      public_id: options?.publicId,
      transformation: options?.transformation,
      resource_type: 'image',
    })

    return {
      url: result.secure_url,
      publicId: result.public_id,
      error: null,
    }
  } catch (err) {
    console.error('[Cloudinary] Upload error:', err)
    return { url: null, publicId: null, error: 'Image upload failed' }
  }
}

// Delete image by public ID
export async function deleteImage(publicId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    await cloudinary.uploader.destroy(publicId)
    return { success: true, error: null }
  } catch (err) {
    console.error('[Cloudinary] Delete error:', err)
    return { success: false, error: 'Image delete failed' }
  }
}

// Generate optimized image URL
export function getOptimizedUrl(
  publicId: string,
  options?: { width?: number; height?: number; quality?: number }
): string {
  return cloudinary.url(publicId, {
    fetch_format: 'auto',
    quality: options?.quality || 'auto',
    width: options?.width,
    height: options?.height,
    crop: options?.width || options?.height ? 'fill' : undefined,
  })
}
