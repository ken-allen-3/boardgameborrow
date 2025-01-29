export interface GameData {
  id: string;
  name: string;
  rank: {
    abstracts: number | null;
    cgs: number | null;
    childrens: number | null;
    family: number | null;
    party: number | null;
    strategy: number | null;
    thematic: number | null;
    wargames: number | null;
  };
  image?: string;
  playerCount?: {
    min: number;
    max: number;
  };
  playTime?: {
    min: number;
    max: number;
  };
  age?: {
    min: number;
  };
  description?: string;
  type?: string;
}

export interface BoardGame {
  id: string;
  name: string;
  year_published: number;
  min_players: number;
  max_players: number;
  min_playtime: number;
  max_playtime: number;
  age: {
    min: number;
  };
  description: string;
  thumb_url: string;
  image_url: string;
  rank: number;
  average_user_rating: number;
  mechanics: any[];
  categories: {
    id: string;
    url: string;
    value: string;
  }[];
  publishers: any[];
  designers: any[];
  developers: any[];
  artists: any[];
  names: any[];
  num_user_ratings: number;
  historical_low_prices: any[];
  primary_publisher: {
    id: string;
    score: number;
    url: string;
  };
  primary_designer: {
    id: string;
    score: number;
    url: string;
  };
  related_to: any[];
  related_as: any[];
  weight_amount: number;
  weight_units: string;
  size_height: number;
  size_depth: number;
  size_units: string;
  active: boolean;
  num_user_complexity_votes: number;
  average_learning_complexity: number;
  average_strategy_complexity: number;
  visits: number;
  lists: number;
  mentions: number;
  links: number;
  plays: number;
  type: string;
  sku: string;
  upc: string;
  price: string;
  price_ca: string;
  price_uk: string;
  price_au: string;
  msrp: number;
  discount: string;
  handle: string;
  url: string;
  rules_url: string;
  official_url: string;
  commentary: string;
  faq: string;
}

export type CategoryKey = keyof GameData['rank'];
