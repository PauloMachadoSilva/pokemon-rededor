export interface NamedApiResource {
  name: string;
  url: string;
}

export interface PokemonListResponse {
  count: number;
  results: NamedApiResource[];
}

export interface PokemonTypeListResponse {
  results: NamedApiResource[];
}

export interface PokemonByTypeResponse {
  pokemon: Array<{ pokemon: NamedApiResource }>;
}

export interface PokemonDetail {
  id: number;
  name: string;
  height: number;
  weight: number;
  abilities: Array<{ ability: NamedApiResource }>;
  types: Array<{ slot: number; type: NamedApiResource }>;
  stats: Array<{ base_stat: number; stat: NamedApiResource }>;
  sprites: {
    front_default?: string | null;
    other?: {
      'official-artwork'?: {
        front_default?: string | null;
      };
      home?: {
        front_default?: string | null;
      };
    };
  };
}

export interface PokemonSpecies {
  flavor_text_entries: Array<{
    flavor_text: string;
    language: { name: string };
  }>;
}
