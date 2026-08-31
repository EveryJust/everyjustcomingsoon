"use client";
import React, { useState, useRef } from 'react';
import { ImagePlus, X, Loader2, UploadCloud } from 'lucide-react';
import ImageCropperModal from '@/components/Admin/ImageCropperModal';

interface ImageUploaderProps {
  images: string[];
  onChange: (urls: string[]) => void;
}

export default function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'everyjust_products';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setSelectedFileUrl(url);
      
      // Reset input so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setSelectedFileUrl(null); // Close modal
    setIsUploading(true);
    
    if (!cloudName) {
      alert("Cloudinary credentials are missing in .env");
      setIsUploading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', croppedBlob, 'image.png');
      formData.append('upload_preset', uploadPreset);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.secure_url) {
        onChange([...images, data.secure_url]);
      } else {
        throw new Error(data.error?.message || "Failed to upload image");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      alert(error.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (indexToRemove: number) => {
    onChange(images.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {images.map((url, index) => (
          <div key={index} className="relative w-32 h-32 rounded-2xl overflow-hidden border border-gray-200 group bg-gray-50 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={url} 
              alt={`Product image ${index + 1}`} 
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
            >
              <X size={16} />
            </button>
          </div>
        ))}
        
        {/* Upload Button visible inline if under limit */}
        {images.length < 10 && (
          <div 
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`relative w-32 h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all bg-gray-50/50 ${
              isUploading ? 'border-gray-200 cursor-not-allowed' : 'border-[#6A43FB]/30 hover:bg-[#6A43FB]/5 cursor-pointer hover:border-[#6A43FB]'
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
            />
            
            {isUploading ? (
              <div className="flex flex-col items-center text-[#6A43FB]">
                <Loader2 size={24} className="animate-spin mb-2" />
                <span className="text-xs font-bold">Uploading</span>
              </div>
            ) : (
              <div className="flex flex-col items-center text-[#6A43FB]">
                <ImagePlus size={24} className="mb-2" />
                <span className="text-xs font-bold text-[#6A43FB]/70">Add Image</span>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedFileUrl && (
        <ImageCropperModal
          isOpen={true}
          imageSrc={selectedFileUrl}
          aspectRatio={3 / 4} // Typical product aspect ratio, can be adjusted
          onClose={() => setSelectedFileUrl(null)}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
}
