const UNSPLASH_ACCESS_KEY = 'YOUR_UNSPLASH_ACCESS_KEY';

export async function getSuggestedImages(title: string): Promise<string[]> {
  // For now, return themed images based on keywords in the title
  const keywords = title.toLowerCase();
  
  if (keywords.includes('dnd') || keywords.includes('d&d') || keywords.includes('dungeons')) {
    return [
      'https://images.unsplash.com/photo-1605870445919-838d190e8e1b?auto=format&fit=crop&q=80&w=800&h=400',
      'https://images.unsplash.com/photo-1614682835402-6e73c8c25e92?auto=format&fit=crop&q=80&w=800&h=400',
      'https://images.unsplash.com/photo-1596495717764-0e090c92e77a?auto=format&fit=crop&q=80&w=800&h=400',
      'https://images.unsplash.com/photo-1518736114810-3f3bedfec66a?auto=format&fit=crop&q=80&w=800&h=400',
      'https://images.unsplash.com/photo-1629260224143-6b5a6f19e57a?auto=format&fit=crop&q=80&w=800&h=400',
      'https://images.unsplash.com/photo-1551269901-5c5e14c25df7?auto=format&fit=crop&q=80&w=800&h=400',
      'https://images.unsplash.com/photo-1566454825481-9c31bd88c6c9?auto=format&fit=crop&q=80&w=800&h=400',
      'https://images.unsplash.com/photo-1523875197105-1897b5a95f81?auto=format&fit=crop&q=80&w=800&h=400'
    ];
  }
  
  if (keywords.includes('party') || keywords.includes('night')) {
    return [
      'https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&q=80&w=800&h=400',
      'https://images.unsplash.com/photo-1528495612343-9ca9f4a4de28?auto=format&fit=crop&q=80&w=800&h=400',
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800&h=400',
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800&h=400',
      'https://images.unsplash.com/photo-1496843916299-590492c751f4?auto=format&fit=crop&q=80&w=800&h=400',
      'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&q=80&w=800&h=400',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800&h=400',
      'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?auto=format&fit=crop&q=80&w=800&h=400'
    ];
  }
  
  // Default board game themed images
  return [
    'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&q=80&w=800&h=400',
    'https://images.unsplash.com/photo-1632501641765-e568d28b0015?auto=format&fit=crop&q=80&w=800&h=400',
    'https://images.unsplash.com/photo-1611371805429-8b5c1b2c34ba?auto=format&fit=crop&q=80&w=800&h=400',
    'https://images.unsplash.com/photo-1606503153255-59d8b2e4739e?auto=format&fit=crop&q=80&w=800&h=400',
    'https://images.unsplash.com/photo-1637214137175-c6b8b89d0312?auto=format&fit=crop&q=80&w=800&h=400',
    'https://images.unsplash.com/photo-1611264199213-343b9974eac1?auto=format&fit=crop&q=80&w=800&h=400',
    'https://images.unsplash.com/photo-1638123308638-debb8954dcd0?auto=format&fit=crop&q=80&w=800&h=400',
    'https://images.unsplash.com/photo-1606503153255-59d8b2e4739e?auto=format&fit=crop&q=80&w=800&h=400'
  ];
}
