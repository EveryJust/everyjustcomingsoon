import React from 'react';

export default function Testimonials() {
  const testimonials = [
    {
      id: 1,
      title: '"Reliable product delivers."',
      text: 'The point of using Lorem Ipsum is that & normal they a always wash up well thisversions of lorem Ipsum.',
      name: 'Stefanie Rashford',
      // Using initials placeholder since we don't have avatar images
      avatarColor: 'bg-blue-600',
      initials: 'SR'
    },
    {
      id: 2,
      title: '"Excellent customer service."',
      text: 'The point of using Lorem Ipsum is that & normal they a always wash up well thisversions of lorem Ipsum.',
      name: 'Augusta Wind',
      avatarColor: 'bg-pink-600',
      initials: 'AW'
    },
    {
      id: 3,
      title: '"Impressive durable & reliable"',
      text: 'The point of using Lorem Ipsum is that & normal they a always wash up well thisversions of lorem Ipsum.',
      name: 'Reema Ghurde',
      avatarColor: 'bg-green-600',
      initials: 'RG'
    },
    {
      id: 4,
      title: '"Fast Service, Quality Parts!"',
      text: 'The point of using Lorem Ipsum is that & normal they a always wash up well thisversions of lorem Ipsum.',
      name: 'Luies Charls',
      avatarColor: 'bg-purple-600',
      initials: 'LC'
    }
  ];

  return (
    <div className="py-12 sm:py-16 relative overflow-hidden bg-[#eef5f9] -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-12 lg:px-12 rounded-sm mb-8 sm:mb-12">
      {/* Subtle Background Pattern Mock */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#000 1.5px, transparent 1.5px)', backgroundSize: '30px 30px' }} />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl font-bold text-gray-900">What Our Clients Say</h2>
          
          <div className="flex gap-2">
             <button className="w-8 h-8 bg-white hover:bg-primary hover:text-white rounded-full flex items-center justify-center text-gray-500 shadow-sm transition-colors cursor-pointer">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
             </button>
             <button className="w-8 h-8 bg-white hover:bg-primary hover:text-white rounded-full flex items-center justify-center text-gray-500 shadow-sm transition-colors cursor-pointer">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
             </button>
           </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id} 
              className="bg-white p-8 rounded-sm shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              {/* Stars */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              
              {/* Title */}
              <h4 className="font-bold text-gray-900 text-sm mb-3">
                {testimonial.title}
              </h4>
              
              {/* Text */}
              <p className="text-gray-500 text-sm mb-8 leading-relaxed flex-grow">
                {testimonial.text}
              </p>
              
              {/* Author */}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${testimonial.avatarColor}`}>
                  {testimonial.initials}
                </div>
                <span className="font-bold text-gray-900 text-sm">
                  {testimonial.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
