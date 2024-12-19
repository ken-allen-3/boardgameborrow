export interface BoardGame {
  id: string;
  name: string;
  handle: string;
  url: string;
  price: string;
  price_ca: string;
  price_uk: string;
  price_au: string;
  msrp: number;
  discount: string;
  year_published: number;
  min_players: number;
  max_players: number;
  min_playtime: number;
  max_playtime: number;
  min_age: number;
  description: string;
  commentary: string;
  faq: string;
  thumb_url: string;
  image_url: string;
  matches_specs?: null;
  specs?: null;
  mechanics: GameMechanic[];
  categories: GameCategory[];
  publishers: GamePublisher[];
  designers: GameDesigner[];
  primary_publisher: GamePublisher;
  primary_designer: GameDesigner;
  developers: any[];
  related_to: any[];
  related_as: any[];
  artists: string[];
  names: string[];
  rules_url: string;
  official_url: string;
  weight_amount: number;
  weight_units: string;
  size_height: number;
  size_depth: number;
  size_units: string;
  num_user_ratings: number;
  average_user_rating: number;
  historical_low_prices: HistoricalLowPrice[];
  active: boolean;
  num_user_complexity_votes: number;
  average_learning_complexity: number;
  average_strategy_complexity: number;
  visits: number;
  lists: number;
  mentions: number;
  links: number;
  plays: number;
  rank: number;
  type: string;
  sku: string;
  upc: string;
}

interface GameMechanic {
  id: string;
  url: string;
}

interface GameCategory {
  id: string;
  url: string;
}

interface GamePublisher {
  id: string;
  num_games?: null;
  score: number;
  game?: null;
  url: string;
  images?: null;
}

interface GameDesigner {
  id: string;
  num_games?: null;
  score: number;
  game?: null;
  url: string;
  images?: null;
}

interface HistoricalLowPrice {
  country: string;
  date: string;
  price: number;
  isLow: boolean;
}