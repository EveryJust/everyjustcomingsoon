"use client";
import React from 'react';
import { CldUploadWidget } from 'next-cloudinary';
import { ImagePlus, X } from 'lucide-react';

interface ImageUploaderProps {
  images: string[];
  onChange: (urls: string[]) => void;
}

export default function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const handleUpload = (result: any) => {
    if (result.info && result.info.secure_url) {
      onChange([...images, result.info.secure_url]);
    }
  };

  const removeImage = (indexToRemove: number) => {
    onChange(images.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {images.map((url, index) => (
          <div key={index} className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={url} 
              alt={`Product image ${index + 1}`} 
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      <CldUploadWidget 
        uploadPreset="everyjust_products" // Make sure to configure this in Cloudinary!
        onSuccess={handleUpload}
        options={{
            multiple: true,
            maxFiles: 5,
        }}
      >
        {({ open }) => {
          return (
            <button
              type="button"
              onClick={() => open()}
              className="flex items-center gap-2 px-6 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-[#6A43FB] hover:text-[#6A43FB] transition-colors font-medium w-full justify-center"
            >
              <ImagePlus size={20} />
              Upload Images
            </button>
          );
        }}
      </CldUploadWidget>
    </div>
  );
}
