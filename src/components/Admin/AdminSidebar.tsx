import Link from 'next/link';

export default function AdminSidebar() {
  const links = [
    { name: 'Dashboard', href: '/admin/dashboard' },
    { name: 'Users', href: '/admin/users' },
    { name: 'Brands', href: '/admin/brands' },
    { name: 'Products', href: '/admin/products' },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-4 flex flex-col">
      <div className="text-2xl font-bold mb-8">Admin Panel</div>
      <nav className="flex-1 flex flex-col gap-2">
        {links.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className="p-3 rounded-md hover:bg-gray-800 transition-colors"
          >
            {link.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
