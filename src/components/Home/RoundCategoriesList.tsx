import React from 'react';

const ROUND_CATEGORIES = [
  { id: 1, title: 'Night Lights', image: '/promo_top_banner.png' },
  { id: 2, title: 'Sunglasses', image: '/promo_bottom_banner.png' },
  { id: 3, title: 'Rakhi', image: '/main_hero_banner.png' },
  { id: 4, title: 'Frisbees', image: '/dash_camera.png' },
  { id: 5, title: 'Power Tools', image: '/promo_top_banner.png' },
];

export default function RoundCategoriesList() {
  return (
    <div className="flex overflow-x-auto gap-4 py-4 scrollbar-hide snap-x mx-4">
      {ROUND_CATEGORIES.map((cat) => (
        <div key={cat.id} className="snap-start flex flex-col items-center gap-2 min-w-[72px]">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-100 shadow-sm bg-white p-1">
            <div className="w-full h-full rounded-full bg-cover bg-center" style={{ backgroundImage: `url('${cat.image}')` }} />
          </div>
          <span className="text-[10px] font-semibold text-center text-gray-700 leading-tight w-16">
            {cat.title}
          </span>
        </div>
      ))}
    </div>
  );
}
