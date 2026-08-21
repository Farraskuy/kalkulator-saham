import { v2 as cloudinary, UploadApiResponse, UploadApiOptions } from "cloudinary";

const cloudName =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
  process.env.CLOUDINARY_CLOUD_NAME;

// Initialize Cloudinary with environment variables
if (process.env.CLOUDINARY_URL) {
  cloudinary.config({
    secure: true,
  });
} else if (
  cloudName &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

/**
 * Checks if Cloudinary is configured via environment variables
 */
export function isCloudinaryConfigured(): boolean {
  const cName =
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    process.env.CLOUDINARY_CLOUD_NAME;
  return Boolean(
    process.env.CLOUDINARY_URL ||
      (cName &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET)
  );
}

export interface CloudinaryUploadOptions {
  folder?: string;
  publicId?: string;
  tags?: string[];
  transformation?: UploadApiOptions["transformation"];
}

/**
 * Upload an image buffer or base64 to Cloudinary using upload_stream
 * Ref: https://cloudinary.com/documentation/image_upload_api_reference
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  options?: CloudinaryUploadOptions
): Promise<UploadApiResponse> {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary credentials are not configured in environment variables.");
  }

  return new Promise((resolve, reject) => {
    const uploadOptions: UploadApiOptions = {
      resource_type: "image",
      folder: options?.folder || "hitungsaham",
      public_id: options?.publicId,
      tags: options?.tags,
      transformation: options?.transformation,
    };

    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error("Failed to upload image to Cloudinary"));
        }
        resolve(result);
      }
    );

    stream.end(buffer);
  });
}

/**
 * Extracts the Cloudinary public_id from a Cloudinary image URL
 */
export function extractCloudinaryPublicId(url: string | null | undefined): string | null {
  if (!url || typeof url !== "string") return null;
  const match = url.match(
    /https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/(?:[a-zA-Z0-9_,:-]+\/)*(?:v\d+\/)?([^\s\)\"\?#]+)/
  );
  if (!match || !match[1]) return null;
  // Strip file extension (.webp, .jpg, .png, etc.)
  return match[1].replace(/\.[a-zA-Z0-9]+$/, "");
}

/**
 * Extracts all Cloudinary public_ids from markdown content and optional cover image
 */
export function extractAllCloudinaryPublicIds(
  content?: string | null,
  coverImage?: string | null
): string[] {
  const ids = new Set<string>();

  if (coverImage) {
    const coverId = extractCloudinaryPublicId(coverImage);
    if (coverId) ids.add(coverId);
  }

  if (content) {
    const regex =
      /https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/(?:[a-zA-Z0-9_,:-]+\/)*(?:v\d+\/)?([^\s\)\"\?#]+)/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      if (match[1]) {
        const publicId = match[1].replace(/\.[a-zA-Z0-9]+$/, "");
        ids.add(publicId);
      }
    }
  }

  return Array.from(ids);
}

/**
 * Delete an image from Cloudinary by public ID
 */
export async function deleteFromCloudinary(publicId: string) {
  if (!isCloudinaryConfigured() || !publicId) return null;
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error(`Failed to delete Cloudinary asset (${publicId}):`, error);
    return null;
  }
}

/**
 * Delete multiple images from Cloudinary by their public IDs
 */
export async function deleteManyFromCloudinary(publicIds: string[]) {
  if (!isCloudinaryConfigured() || !publicIds.length) return [];
  const uniqueIds = Array.from(new Set(publicIds.filter(Boolean)));
  return Promise.allSettled(uniqueIds.map((id) => deleteFromCloudinary(id)));
}

export { cloudinary };

