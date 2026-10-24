import type { CategoryTreeItem } from '@plentymarkets/shop-api';

import type { UseCategoryTreeState, UseCategoryTreeMethodsReturn, GetCategoryTree, SetCategoryTree } from './types';

// Kategorien, die nicht ins Menü gehören: 678 = Inhaltskategorie „Startseite“ (im LTS ebenfalls nicht im Menü)
const HIDDEN_CATEGORY_IDS = new Set([678]);

const withoutHiddenCategories = (data: CategoryTreeItem[]) =>
  data.filter((category) => !HIDDEN_CATEGORY_IDS.has(Number(category.id)));

/**
 * @description Composable for managing the category tree.
 * @returns UseCategoryTreeMethodsReturn
 * @example
 * ``` ts
 * const { data, loading, getCategoryTree } = useCategoryTree();
 * ```
 */
export const useCategoryTree: UseCategoryTreeMethodsReturn = () => {
  const state = useState<UseCategoryTreeState>('useCategoryTree', () => ({
    data: [] as CategoryTreeItem[],
    loading: false,
  }));

  /**
   * @description Function for fetching the category tree.
   * @example
   * ``` ts
   * getCategoryTree();
   * ```
   */
  const getCategoryTree: GetCategoryTree = async () => {
    state.value.loading = true;
    try {
      const data = await useSdk().plentysystems.getCategoryTree();
      state.value.data = data?.data ? withoutHiddenCategories(data.data) : state.value.data;
      return state.value.data;
    } catch (error) {
      throw new Error(error as string, { cause: error });
    } finally {
      state.value.loading = false;
    }
  };

  /**
   * @description Function for setting the category tree data.
   * @example
   * ``` ts
   * setCategoryTree();
   * ```
   */
  const setCategoryTree: SetCategoryTree = (data: CategoryTreeItem[]) => {
    state.value.data = withoutHiddenCategories(data);
  };

  return {
    getCategoryTree,
    setCategoryTree,
    ...toRefs(state.value),
  };
};
