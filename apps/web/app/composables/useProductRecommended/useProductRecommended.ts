import type { FacetSearchCriteria } from '@plentymarkets/shop-api';

/**
 * Composable for managing recommended products data
 * @param categoryId Product slug
 * @return UseProductRecommendedReturn
 * @example
 * ``` ts
 * const { data, loading, fetchProductRecommended } = useProductRecommended('1');
 * ```
 */
export const useProductRecommended: UseProductRecommendedReturn = (categoryId: string) => {
  const state = useState<UseProductRecommendedState>(`useProductRecommended-${categoryId}`, () => ({
    data: [],
    loading: false,
  }));

  /** Function for fetching product recommended data
   * @return FetchProductRecommended
   * @example
   * ``` ts
   * fetchProductRecommended('1');
   * ```
   * @param params
   */
  const fetchProductRecommended: FetchProductRecommended = async (params: FacetSearchCriteria) => {
    state.value.loading = true;

    const common = {
      // Dorins: 12 Artikel wie „Unsere Topartikel“ im bisherigen Shop
      itemsPerPage: 12,
      // Dorins: neueste Artikel zuerst wie „Unsere Topartikel“ und „mehr aus dieser Kollektion“ im bisherigen Shop
      sort: 'item.id_desc',
      type: params.type,
    };

    const payload =
      params.type === 'last_seen'
        ? { type: params.type }
        : {
            ...common,
            itemId: params.itemId,
            crossSellingRelation: params.crossSellingRelation,
            categoryId: params.categoryId,
          };

    const idForKey = params.type === 'cross_selling' ? params.itemId : params.categoryId;

    const { data, error } = await useAsyncData(
      `useProductRecommended-${params.type}-${idForKey}-${params.crossSellingRelation}`,
      () => useSdk().plentysystems.getFacet(payload),
    );

    useHandleError(error.value ?? null);
    state.value.data = data?.value?.data?.products ?? state.value.data;
    state.value.loading = false;
    return state.value.data;
  };

  return {
    fetchProductRecommended,
    ...toRefs(state.value),
  };
};
