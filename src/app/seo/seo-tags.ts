import { SeoRoute, SeoRouteParams } from './seo-routes';

export interface SeoTags {
  title: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalPath?: string;
  canonicalUrl?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
}

const SITE_NAME = 'RedeDor Pokédex';

const SEO_TAGS = {
  [SeoRoute.List]: (): SeoTags => ({
    title: `${SITE_NAME} | Lista de Pokémon`,
    description:
      'Explore uma Pokédex moderna com filtros por nome e tipo, paginação inteligente e detalhes completos.',
    ogTitle: `${SITE_NAME} | Lista de Pokémon`,
    ogDescription: 'Lista responsiva com filtros e paginação para explorar a PokéAPI.',
    canonicalPath: '/'
  }),
  [SeoRoute.Detail]: (params: SeoRouteParams[SeoRoute.Detail]): SeoTags => ({
    title: `${SITE_NAME} | ${params.name}`,
    description: `Detalhes, estatísticas e habilidades do Pokémon ${params.name}.`,
    ogTitle: `${SITE_NAME} | ${params.name}`,
    ogDescription: `Confira o perfil completo do Pokémon ${params.name}.`,
    ogImage: params.image || undefined,
    canonicalPath: params.id ? `/pokemon/${params.id}` : `/pokemon/${params.name.toLowerCase()}`
  })
} as const;

export function getSeoTags(route: SeoRoute.List): SeoTags;
export function getSeoTags(
  route: SeoRoute.Detail,
  params: SeoRouteParams[SeoRoute.Detail]
): SeoTags;
export function getSeoTags(
  route: SeoRoute,
  params?: SeoRouteParams[SeoRoute.Detail]
): SeoTags {
  if (route === SeoRoute.Detail) {
    if (!params) {
      throw new Error('Parâmetros obrigatórios ausentes para SEO de detalhe.');
    }
    return SEO_TAGS[SeoRoute.Detail](params);
  }
  return SEO_TAGS[SeoRoute.List]();
}
