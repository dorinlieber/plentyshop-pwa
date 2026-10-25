/**
 * Dorins search extension: wraps the native plenty search with two additions.
 * 1. Typo correction: plenty returns `itemList.suggestions.didYouMean` on zero hits, the SDK drops it.
 *    We read it with a raw call and search again with the corrected term (what plentyShop LTS/IO does).
 * 2. Sizes in the query ("jeans 140"): size tokens are removed from the term and set as values of the
 *    size facet, so only items available in that size are returned.
 */
const SIZE_TOKEN = /^\d{2,3}(\/\d{2,3})?$/;
const SIZE_FACET_NAME = /^gr(ö|oe)(ß|ss)e$/i;
const MIN_SIZE = 44;
const MAX_SIZE = 188;

type SearchParams = Record<string, any> & { term?: string; facets?: string; autoSize?: boolean };
type SearchInfo = { originalTerm: string; term: string; corrected: boolean; sizes: string[]; sizeFacetValueIds: string[] };

const isSize = (token: string) =>
  SIZE_TOKEN.test(token) && token.split('/').every((part) => Number(part) >= MIN_SIZE && Number(part) <= MAX_SIZE);

const splitTerm = (term: string) => {
  const tokens = term.trim().split(/\s+/).filter(Boolean);
  const sizes = tokens.filter(isSize);
  const rest = tokens.filter((token) => !isSize(token));
  // a query that is only a size ("140") stays a normal search
  return rest.length > 0 ? { text: rest.join(' '), sizes } : { text: term.trim(), sizes: [] };
};

const fetchDidYouMean = async (context: any, term: string): Promise<string | null> => {
  const url = new URL('/rest/storefront/items', context.config.api.url);
  url.searchParams.set('type', 'search');
  url.searchParams.set('query', term);
  url.searchParams.set('items', '1');
  const { data: response } = await context.client.get(url.href);
  const entries = response?.data?.itemList?.suggestions?.didYouMean ?? [];
  // only single words, each replaced by its best suggestion
  const corrections = new Map<string, string>();
  for (const entry of entries) {
    if (!entry?.text || entry.text.includes(' ')) continue;
    const best = entry.suggestions?.[0]?.text;
    if (best && best !== entry.text) corrections.set(entry.text.toLowerCase(), best);
  }
  if (corrections.size === 0) return null;
  const corrected = term
    .split(/\s+/)
    .map((word) => corrections.get(word.toLowerCase()) ?? word)
    .join(' ');
  return corrected.toLowerCase() === term.toLowerCase() ? null : corrected;
};

const sizeFacetValueIds = (facets: any[], sizes: string[]) => {
  const facet = facets?.find((f) => SIZE_FACET_NAME.test(f?.name ?? ''));
  if (!facet) return [];
  return (facet.values ?? [])
    .filter((value: any) => {
      const parts = String(value.name).split('/');
      return sizes.some((size) => value.name === size || size.split('/').some((part) => parts.includes(part)));
    })
    .map((value: any) => String(value.id));
};

const joinFacets = (...lists: (string | undefined)[]) =>
  lists
    .flatMap((list) => (list ? list.split(',') : []))
    .filter(Boolean)
    .join(',');

const searchWithSizes = async (context: any, params: SearchParams, text: string, sizes: string[]) => {
  const first = await context.api.getSearch({ ...params, term: text });
  if (sizes.length === 0 || params.autoSize === false) return { result: first, ids: [] as string[] };
  const ids = sizeFacetValueIds(first?.data?.facets ?? [], sizes);
  if (ids.length === 0) return { result: first, ids };
  const filtered = await context.api.getSearch({ ...params, term: text, facets: joinFacets(params.facets, ids.join(',')) });
  return { result: filtered, ids };
};

export const dorinsSearchExtension = {
  name: 'dorins-search',
  extendApiMethods: {
    getSearchDorins: async (context: any, params: SearchParams) => {
      const originalTerm = String(params.term ?? '');
      const { text, sizes } = splitTerm(originalTerm);
      let term = text;
      let { result, ids } = await searchWithSizes(context, params, term, sizes);
      let corrected = false;

      if ((result?.data?.pagination?.totals ?? 0) === 0 && term) {
        const suggestion = await fetchDidYouMean(context, term);
        if (suggestion) {
          const retry = await searchWithSizes(context, params, suggestion, sizes);
          if ((retry.result?.data?.pagination?.totals ?? 0) > 0) {
            ({ result, ids } = retry);
            term = suggestion;
            corrected = true;
          }
        }
      }

      const searchInfo: SearchInfo = {
        originalTerm,
        term,
        corrected,
        sizes: ids.length > 0 ? sizes : [],
        sizeFacetValueIds: ids,
      };
      return { ...result, data: { ...result?.data, searchInfo } };
    },
  },
};
