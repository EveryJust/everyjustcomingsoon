import Link from 'next/link';
import { MAJOR_CATEGORIES } from '../utils/category';

export default function Navbar() {
  return (
    <nav className="hidden lg:block bg-primary text-white shadow-md">
      <div className="max-w-7xl mx-auto flex items-center">
        {/* Categories Dropdown */}
        <div className="relative group cursor-pointer bg-white text-gray-800 flex items-center gap-2 px-4 xl:px-6 py-4 font-bold w-52 xl:w-64 border-r border-gray-200">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          CATEGORIES
          <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          
          {/* Dropdown Menu */}
          <div className="absolute top-full left-0 w-full bg-white shadow-lg border border-gray-100 rounded-b-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <ul className="py-2 flex flex-col">
              {MAJOR_CATEGORIES.slice(0, 10).map(cat => (
                <li key={cat.id}>
                  <Link href={`/category/${cat.slug}`} className="block px-6 py-2.5 text-sm font-semibold text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/categories" className="block px-6 py-3 text-sm font-bold text-primary hover:bg-gray-50 transition-colors border-t border-gray-100 mt-1">
                  VIEW ALL
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Main Links */}
        <div className="flex items-center gap-3 xl:gap-8 px-4 xl:px-8 font-semibold text-sm xl:text-base flex-grow">
          <Link href="/" className="hover:text-white/80 transition-colors">Home</Link>
          <Link href="/shop" className="hover:text-white/80 transition-colors">Shop</Link>
          <Link href="/brands" className="hover:text-white/80 transition-colors whitespace-nowrap">Brands</Link>
          <Link href="/play" className="flex items-center gap-1 xl:gap-1.5 bg-white text-primary px-2 xl:px-3.5 py-1 xl:py-1.5 rounded-full font-extrabold hover:bg-gray-100 transition-all shadow-sm transform hover:scale-105 whitespace-nowrap">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            Play
          </Link>
          <Link href="/reels" className="hover:text-white/80 transition-colors whitespace-nowrap">Reels</Link>
          <Link href="/about-us" className="hover:text-white/80 transition-colors whitespace-nowrap">About Us</Link>
          <Link href="/contact" className="hover:text-white/80 transition-colors whitespace-nowrap">Contact</Link>
          <Link href="/help" className="hover:text-white/80 transition-colors whitespace-nowrap">Help</Link>
        </div>

        {/* Right Deal */}
        <div className="px-6 flex items-center gap-2 font-bold cursor-pointer hover:text-white/80 hidden xl:flex whitespace-nowrap">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Weekly Deal
        </div>
      </div>
    </nav>
  );
}
