"use client";
import React, { useState, useRef } from 'react';
import { ImagePlus, X, Loader2, UploadCloud } from 'lucide-react';
import ImageCropperModal from '@/components/Admin/ImageCropperModal';

interface SingleImageUploaderProps {
  image?: string;
  onChange: (url: string) => void;
  onRemove: () => void;
}

export default function SingleImageUploader({ image, onChange, onRemove }: SingleImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setSelectedFileUrl(url);
    }
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setSelectedFileUrl(null); // Close modal
    setIsUploading(true);
    
    if (!cloudName || !uploadPreset) {
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
        onChange(data.secure_url);
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

  return (
    <div className="space-y-4">
      {image ? (
        <div className="relative w-40 h-40 rounded-2xl overflow-hidden border border-gray-200 group bg-gray-50 flex items-center justify-center p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={image} 
            alt="Category" 
            className="w-full h-full object-contain drop-shadow-md"
          />
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div 
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`relative w-full border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all bg-gray-50/50 ${
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
              <Loader2 size={32} className="animate-spin mb-3" />
              <p className="text-sm font-bold">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center text-gray-500">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 mb-3">
                <UploadCloud size={24} className="text-[#6A43FB]" />
              </div>
              <p className="text-sm font-bold text-gray-700">Click to upload image</p>
              <p className="text-xs mt-1 opacity-70">PNG, JPG up to 10MB</p>
            </div>
          )}
        </div>
      )}

      {selectedFileUrl && (
        <ImageCropperModal
          isOpen={true}
          imageSrc={selectedFileUrl}
          aspectRatio={1} // 1:1 for categories
          onClose={() => setSelectedFileUrl(null)}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
}
