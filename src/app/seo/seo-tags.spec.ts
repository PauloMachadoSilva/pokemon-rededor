import { SeoRoute } from './seo-routes';
import { getSeoTags } from './seo-tags';

describe('getSeoTags', () => {
  it('retorna tags da lista', () => {
    const tags = getSeoTags(SeoRoute.List);

    expect(tags.title).toBe('RedeDor Pokédex | Lista de Pokémon');
    expect(tags.description).toContain('Pokédex');
    expect(tags.ogTitle).toBe('RedeDor Pokédex | Lista de Pokémon');
    expect(tags.ogDescription).toContain('PokéAPI');
    expect(tags.ogImage).toBeUndefined();
    expect(tags.canonicalPath).toBe('/');
  });

  it('retorna tags do detalhe com imagem', () => {
    const tags = getSeoTags(SeoRoute.Detail, {
      name: 'Bulbasaur',
      image: 'https://cdn.test/bulbasaur.png',
      id: 1
    });

    expect(tags.title).toBe('RedeDor Pokédex | Bulbasaur');
    expect(tags.description).toContain('Bulbasaur');
    expect(tags.ogTitle).toBe('RedeDor Pokédex | Bulbasaur');
    expect(tags.ogDescription).toContain('Bulbasaur');
    expect(tags.ogImage).toBe('https://cdn.test/bulbasaur.png');
    expect(tags.canonicalPath).toBe('/pokemon/1');
  });

  it('retorna tags do detalhe sem imagem', () => {
    const tags = getSeoTags(SeoRoute.Detail, {
      name: 'Pikachu'
    });

    expect(tags.title).toBe('RedeDor Pokédex | Pikachu');
    expect(tags.ogImage).toBeUndefined();
    expect(tags.canonicalPath).toBe('/pokemon/pikachu');
  });

  it('lança erro quando detalhe não recebe parametros', () => {
    const unsafeCall = getSeoTags as unknown as (
      route: SeoRoute,
      params?: unknown
    ) => ReturnType<typeof getSeoTags>;

    expect(() => unsafeCall(SeoRoute.Detail)).toThrowError(
      'Parâmetros obrigatórios ausentes para SEO de detalhe.'
    );
  });
});
