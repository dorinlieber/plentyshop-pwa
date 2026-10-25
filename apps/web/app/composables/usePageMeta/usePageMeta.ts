export const usePageMeta = () => {
  const pageMeta = useState('pageMeta', () => ({
    name: '',
    icon: '',
  }));

  /**
   * @param setHeadTitle Statische Seiten (Impressum, AGB, Warenkorb …) übernehmen den Namen auch als Seitentitel,
   * sonst tragen sie alle den Startseiten-Titel (doppelte Titel, schlecht für SEO).
   */
  const setPageMeta = (name: string, icon: string, setHeadTitle = false) => {
    pageMeta.value.name = name;
    pageMeta.value.icon = icon;
    if (setHeadTitle && name) useHead({ title: name });
  };

  return { setPageMeta, pageMeta };
};
