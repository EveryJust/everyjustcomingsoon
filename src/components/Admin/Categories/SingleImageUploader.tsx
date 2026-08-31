"use client";
import React from 'react';
import { CldUploadWidget } from 'next-cloudinary';
import { ImagePlus, X } from 'lucide-react';

interface SingleImageUploaderProps {
  image?: string;
  onChange: (url: string) => void;
  onRemove: () => void;
}

export default function SingleImageUploader({ image, onChange, onRemove }: SingleImageUploaderProps) {
  const handleUpload = (result: any) => {
    if (result.info && result.info.secure_url) {
      onChange(result.info.secure_url);
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
        <CldUploadWidget 
          uploadPreset="everyjust_categories" // Must configure this in Cloudinary to accept only png
          onSuccess={handleUpload}
          options={{
              multiple: false,
              maxFiles: 1,
              clientAllowedFormats: ["png"] // Enforce PNG only for categories
          }}
        >
          {({ open }) => {
            return (
              <button
                type="button"
                onClick={() => open()}
                className="flex flex-col items-center justify-center gap-3 w-40 h-40 border-2 border-dashed border-gray-300 rounded-2xl text-gray-400 hover:border-[#6A43FB] hover:text-[#6A43FB] hover:bg-[#6A43FB]/5 transition-all font-medium"
              >
                <ImagePlus size={28} />
                <span className="text-xs text-center px-4">Upload Transparent PNG</span>
              </button>
            );
          }}
        </CldUploadWidget>
      )}
    </div>
  );
}
