export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  subcategories?: string[];
}

export const MAJOR_CATEGORIES: Category[] = [
  {
    id: 'c1',
    name: 'Clothes & Apparel',
    slug: 'clothes-apparel',
    subcategories: ['Menswear', 'Womenswear', 'Activewear', 'Outerwear']
  },
  {
    id: 'c2',
    name: 'Bags & Footwear',
    slug: 'bags-footwear',
    subcategories: ['Sneakers', 'Boots', 'Handbags', 'Backpacks']
  },
  {
    id: 'c3',
    name: 'Jewelry & Watches',
    slug: 'jewelry-watches',
    subcategories: ['Necklaces', 'Rings', 'Smartwatches', 'Luxury Watches']
  },
  {
    id: 'c4',
    name: 'Beauty & Personal Care',
    slug: 'beauty-personal-care',
    subcategories: ['Skincare', 'Makeup', 'Hair Care', 'Fragrances']
  },
  {
    id: 'c5',
    name: 'Toys & Kids',
    slug: 'toys-kids',
    subcategories: ['Action Figures', 'Dolls', 'Educational', 'Nursery']
  },
  {
    id: 'c6',
    name: 'Sports & Outdoors',
    slug: 'sports-outdoors',
    subcategories: ['Exercise', 'Camping', 'Cycling', 'Team Sports']
  },
  {
    id: 'c7',
    name: 'Electronics & Gadgets',
    slug: 'electronics-gadgets',
    subcategories: ['Smartphones', 'Laptops', 'Audio', 'Cameras']
  },
  {
    id: 'c8',
    name: 'Home & Kitchen',
    slug: 'home-kitchen',
    subcategories: ['Furniture', 'Decor', 'Cookware', 'Bedding']
  },
  {
    id: 'c9',
    name: 'Health & Wellness',
    slug: 'health-wellness',
    subcategories: ['Vitamins', 'Supplements', 'Medical Supplies', 'Fitness Tech']
  },
  {
    id: 'c10',
    name: 'Tools & Home Improvement',
    slug: 'tools-home-improvement',
    subcategories: ['Power Tools', 'Hardware', 'Lighting', 'Plumbing']
  },
  {
    id: 'c11',
    name: 'Automotive Accessories',
    slug: 'automotive-accessories',
    subcategories: ['Car Care', 'Interior Accessories', 'Exterior Accessories', 'Electronics']
  },
  {
    id: 'c12',
    name: 'Pet Supplies',
    slug: 'pet-supplies',
    subcategories: ['Dog Food', 'Cat Care', 'Aquariums', 'Toys']
  },
  {
    id: 'c13',
    name: 'Groceries & Gourmet Food',
    slug: 'groceries-gourmet',
    subcategories: ['Snacks', 'Beverages', 'Pantry Staples', 'Organic']
  },
  {
    id: 'c14',
    name: 'Arts, Crafts & Sewing',
    slug: 'arts-crafts-sewing',
    subcategories: ['Painting', 'Knitting', 'Scrapbooking', 'Fabrics']
  },
  {
    id: 'c15',
    name: 'Books & Media',
    slug: 'books-media',
    subcategories: ['Fiction', 'Non-Fiction', 'Music', 'Movies']
  }
];

export const getCategoryBySlug = (slug: string) => {
  return MAJOR_CATEGORIES.find(cat => cat.slug === slug);
};

export const getAllCategoryNames = () => {
  return MAJOR_CATEGORIES.map(cat => cat.name);
};
