import { type CategoryTreeItem, categoryTreeGetters } from '@plentymarkets/shop-api';

// Dorins: kurze Menünamen wie im bisherigen Shop (Kategorien heißen Jungenmode/Mädchenmode)
const MENU_LABELS: Record<string, string> = { jungenmode: 'Jungen', maedchenmode: 'Mädchen' };

export const dorinsMenuLabel = (node: CategoryTreeItem) =>
  MENU_LABELS[categoryTreeGetters.getSlug(node)] ?? categoryTreeGetters.getName(node);
