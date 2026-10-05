/**
 * Helper to upload image files/blobs to Cloudinary using unsigned upload preset
 */
export async function uploadToCloudinary(file: Blob | File): Promise<string> {
  const cloudName = (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'drmroxs00').trim();
  const uploadPreset = (process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'snec-task').trim();

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary credentials (cloud name or upload preset) are missing');
  }

  const isVideo = file.type?.startsWith('video/');
  const endpoint = isVideo ? 'video/upload' : 'image/upload';
  const fileName = (file as File).name || (isVideo ? 'review_video.mp4' : 'review_photo.jpg');

  const formData = new FormData();
  formData.append('file', file, fileName);
  formData.append('upload_preset', uploadPreset);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${endpoint}`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (data.secure_url) {
    return data.secure_url;
  }

  throw new Error(data.error?.message || 'Failed to upload media to Cloudinary');
}
