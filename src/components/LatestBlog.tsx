import React from 'react';

export default function LatestBlog() {
  const blogs = [
    {
      id: 1,
      image: '/main_hero_banner.png', // Placeholder
      date: 'JUNE 20, 2025',
      title: 'How to Replace a Car Part: A Step-by-...',
      excerpt: 'Technology has become an integral part of our lives, revolutionizing the way we work...'
    },
    {
      id: 2,
      image: '/promo_top_banner.png', // Placeholder
      date: 'JUNE 20, 2025',
      title: 'What to Check Before Buying Car...',
      excerpt: 'Welcome to the digital world, where technology is constantly evolving and...'
    },
    {
      id: 3,
      image: '/promo_bottom_banner.png', // Placeholder
      date: 'JUNE 20, 2025',
      title: 'Common Mistakes When Buying Auto...',
      excerpt: 'In a world where information is abundant and time is precious, our blog is your...'
    },
    {
      id: 4,
      image: '/main_hero_banner.png', // Placeholder
      date: 'JUNE 20, 2025',
      title: 'Easy Tips for Choosing Quality Used Aut...',
      excerpt: 'Trends are patterns or shifts in behavior, preferences, or ideas that gain popularity...'
    }
  ];

  return (
    <div className="py-12 mb-12 border-t border-gray-200 mt-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Our Latest Blog</h2>
        <div className="flex gap-2">
           <button className="w-8 h-8 bg-gray-100 hover:bg-primary hover:text-white rounded-full flex items-center justify-center text-gray-500 transition-colors cursor-pointer">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
           </button>
           <button className="w-8 h-8 bg-gray-100 hover:bg-primary hover:text-white rounded-full flex items-center justify-center text-gray-500 transition-colors cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
           </button>
         </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {blogs.map((blog) => (
          <div key={blog.id} className="flex flex-col group cursor-pointer">
            <div className="relative overflow-hidden rounded-sm aspect-[4/3] mb-4">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url('${blog.image}')` }}
              />
            </div>
            
            <div className="flex items-center gap-1.5 text-primary text-xs font-bold mb-3 uppercase tracking-wider">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {blog.date}
            </div>
            
            <h3 className="font-bold text-gray-900 text-[15px] mb-2 leading-snug group-hover:text-primary transition-colors line-clamp-2">
              {blog.title}
            </h3>
            
            <p className="text-gray-500 text-sm mb-4 leading-relaxed line-clamp-3">
              {blog.excerpt}
            </p>
            
            <div className="mt-auto">
              <span className="inline-block border-b-2 border-gray-900 pb-0.5 text-xs font-bold text-gray-900 uppercase tracking-wider group-hover:text-primary group-hover:border-primary transition-colors">
                READ MORE
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
