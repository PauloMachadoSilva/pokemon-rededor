export enum SeoRoute {
  List = 'list',
  Detail = 'detail'
}

export type SeoRouteParams = {
  [SeoRoute.List]: undefined;
  [SeoRoute.Detail]: {
    name: string;
    image?: string | null;
    id?: number | string;
  };
};
