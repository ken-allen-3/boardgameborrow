const UNSPLASH_ACCESS_KEY = 'YOUR_UNSPLASH_ACCESS_KEY';

export async function getSuggestedImages(title: string): Promise<string[]> {
  // For now, return themed images based on keywords in the title
  const keywords = title.toLowerCase();
  
  if (keywords.includes('dnd') || keywords.includes('d&d') || keywords.includes('dungeons')) {
    return [
      'https://images.unsplash.com/photo-1605870445919-838d190e8e1b?auto=format&fit=crop&q=80&w=800&h=400',
      'https://images.unsplash.com/photo-1614682835402-6e73c8c25e92?auto=format&fit=crop&q=80&w=800&h=400',
      'https://images.unsplash.com/photo-1596495717764-0e090c92e77a?auto=format&fit=crop&q=80&w=800&h=400'
    ];
  }
  
  if (keywords.includes('party') || keywords.includes('night')) {
    return [
      'https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&q=80&w=800&h=400',
      'https://images.unsplash.com/photo-1528495612343-9ca9f4a4de28?auto=format&fit=crop&q=80&w=800&h=400',
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800&h=400'
    ];
  }
  
  // Default board game themed images
  return [
    'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&q=80&w=800&h=400',
    'https://images.unsplash.com/photo-1632501641765-e568d28b0015?auto=format&fit=crop&q=80&w=800&h=400',
    'https://images.unsplash.com/photo-1611371805429-8b5c1b2c34ba?auto=format&fit=crop&q=80&w=800&h=400'
  ];
}