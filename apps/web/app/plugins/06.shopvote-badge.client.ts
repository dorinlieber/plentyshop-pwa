/**
 * Shopvote-Bewertungssiegel (unten links), wie im bisherigen Shop.
 * Lädt das offizielle Badge-Skript von shopvote.de und zeigt den Bewertungsschnitt von Dorins Kindermode.
 * Im Editor nicht laden, damit das Siegel dort keine Bedienelemente überdeckt.
 */
const SHOPVOTE_SHOP_ID = 4298;
const SHOPVOTE_BADGE_TYPE = 1;
const SHOPVOTE_SCRIPT = 'https://widgets.shopvote.de/js/reputation-badge-v2.min.js';

declare global {
  interface Window {
    createRBadge?: (shopId: number, badgeType: number, protocol: string) => void;
  }
}

// Abstand unten überall 5 px (keine untere Navigationsleiste mehr). Shopvote setzt ihn inline mit !important,
// deshalb per Skript statt per CSS.
const setBadgeOffset = (attempt = 0) => {
  const badge = document.getElementById('sv-rbadge-box');
  if (!badge) {
    if (attempt < 20) setTimeout(() => setBadgeOffset(attempt + 1), 250);
    return;
  }
  badge.style.setProperty('bottom', '5px', 'important');
};

export default defineNuxtPlugin({
  name: 'shopvote-badge',
  parallel: true,
  setup(nuxtApp) {
    if (nuxtApp.$isEditor) return;

    nuxtApp.hook('app:mounted', () => {
      const script = document.createElement('script');
      script.src = SHOPVOTE_SCRIPT;
      script.defer = true;
      script.onload = () => {
        window.createRBadge?.(SHOPVOTE_SHOP_ID, SHOPVOTE_BADGE_TYPE, 'https');
        setBadgeOffset();
      };
      document.body.appendChild(script);
    });
  },
});
