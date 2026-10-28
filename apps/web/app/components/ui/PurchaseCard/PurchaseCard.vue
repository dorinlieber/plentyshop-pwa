<template>
  <form
    :class="{ '@md:shadow-lg': configuration?.dropShadow, '@md:border @md:border-neutral-100': configuration?.borders }"
    :style="inlineStyle"
    class="@md:rounded-md"
    data-testid="purchase-card"
    @submit.prevent="handleAddToCart()"
  >
    <div class="relative">
      <div class="drift-zoom-image">
        <section class="@md:p-4">
          <template v-for="key in configuration?.fieldsOrder" :key="isTextBlock(key) ? key.uuid : key">
            <template v-if="isTextBlock(key) && key.visible">
              <div
                :class="{ 'ring-2 ring-blue-500 ring-offset-1 rounded': highlightedUuid === key.uuid }"
                :data-uuid="key.uuid"
                class="mb-2 font-normal typography-text-sm break-words no-preflight rte-prose rte-prose--render transition-all duration-300"
                v-html="renderTextBlock(key.content)"
              />
            </template>
            <template v-if="key === 'itemName' && configuration?.fields.itemName">
              <h1 class="font-bold typography-headline-4 break-word" data-testid="product-name">
                {{ displayName }}
              </h1>
              <div class="mb-2 flex items-start justify-between gap-4">
                <!-- Dorins: zwei Zeilen mit fetter Bezeichnung wie im bisherigen Shop -->
                <p class="typography-text-sm" data-testid="product-number-brand">
                  <span class="block"
                    ><strong>{{ t('dorins.itemNumber') }}:</strong> {{ productGetters.getItemId(product) }}</span
                  >
                  <span v-if="brandName" class="block"
                    ><strong>{{ t('dorins.brand') }}:</strong> {{ brandName }}</span
                  >
                </p>
                <!-- Dorins: Markenlogo rechts daneben wie im bisherigen Shop (Logo aus den Herstellerdaten in plenty) -->
                <img
                  v-if="brandLogoUrl"
                  :src="brandLogoUrl"
                  :alt="`${brandName} Logo`"
                  class="dorins-brand-logo"
                  loading="lazy"
                  data-testid="product-brand-logo"
                />
              </div>
            </template>
            <template v-if="key === 'variationNumber' && configuration?.fields.variationNumber">
              <p
                v-if="productGetters.getVariationNumber(product)"
                class="mb-2 typography-text-sm text-neutral-500"
                data-testid="product-variation-number"
              >
                {{ productGetters.getVariationNumber(product) }}
              </p>
            </template>
            <template v-if="key === 'price' && configuration?.fields.price">
              <div class="flex space-x-2">
                <Price :crossed-price="crossedPrice" :price="priceWithProperties" :display-vat-hint="false" />
                <div
                  v-if="(productBundleGetters?.getBundleDiscount(product) ?? 0) > 0 && showBundleComponents"
                  class="m-auto"
                >
                  <UiTag :size="'sm'" :variant="'secondary'">{{
                    t('product.bundleSavings', { percent: productBundleGetters.getBundleDiscount(product) })
                  }}</UiTag>
                </div>
              </div>
              <LowestPrice :product="product" />
              <BasePrice
                v-if="productGetters.showPricePerUnit(product)"
                :base-price="basePriceSingleValue"
                :unit-content="productGetters.getUnitContent(product)"
                :unit-name="productGetters.getUnitName(product)"
              />
              <!-- Dorins: „inkl. MwSt. zzgl. Versandkosten“ direkt unter dem Preis, ohne Sternchen wie im bisherigen Shop -->
              <div class="flex gap-1" data-testid="dorins-vat-hint">
                <span>{{ showNetPrices ? t('product.priceExclVAT') : t('product.priceInclVAT') }}</span>
                <i18n-t keypath="shipping.excludedLabel" scope="global">
                  <template #shipping>
                    <UiLink
                      :href="resolvePathTrailingSlash(localePath(paths.shipping))"
                      class="focus:outline focus:outline-offset-2 focus:outline-2 outline-secondary-600 rounded"
                      target="_blank"
                    >
                      {{ t('common.labels.delivery') }}
                    </UiLink>
                  </template>
                </i18n-t>
              </div>
            </template>
            <!-- Dorins: Abzeichen (slim, Rabatt) stehen wie im bisherigen Shop auf dem Hauptbild (ImageGallery), nicht hier -->
            <template v-if="key === 'availability' && configuration?.fields.availability">
              <UiBadges :product="product" :use-availability="true" :use-tags="false" class="mb-2" />
            </template>
            <template v-if="key === 'variationProperties' && configuration?.fields.variationProperties">
              <div class="mb-2 variation-properties">
                <VariationProperties :product="product" />
              </div>
            </template>
            <template v-if="key === 'starRating' && configuration?.fields.starRating">
              <div class="inline-flex items-center mb-2">
                <SfRating
                  :half-increment="true"
                  :max="5"
                  :value="reviewGetters.getAverageRating(reviewAverage, 'half')"
                  size="xs"
                />
                <SfCounter class="ml-1" size="xs">{{ reviewGetters.getTotalReviews(reviewAverage) }}</SfCounter>
                <UiButton
                  class="ml-2 text-xs text-neutral-500 cursor-pointer"
                  data-testid="show-reviews"
                  variant="tertiary"
                  @click="scrollToReviews"
                >
                  {{ t('product.showAllReviews') }}
                </UiButton>
              </div>
            </template>
            <template v-if="key === 'previewText' && configuration?.fields.previewText">
              <div
                v-if="productGetters.getShortDescription(product).length > 0"
                class="mb-2 font-normal typography-text-sm whitespace-pre-line break-words no-preflight"
                data-testid="product-description"
                v-html="productGetters.getShortDescription(product)"
              />
            </template>

            <template v-if="key === 'addToWishlist' && configuration?.fields.addToWishlist">
              <div
                :class="{ 'justify-center': configuration?.wishlistSize === 'large' }"
                class="flex items-center mt-2"
              >
                <WishlistButton
                  :class="{
                    'mr-2 mb-2 bg-white': viewport.isLessThan('lg'),
                    'w-full': configuration?.wishlistSize === 'large',
                    '!p-0 hover:bg-transparent active:bg-transparent': configuration?.wishlistSize === 'small',
                  }"
                  :product="product"
                  :quantity="quantitySelectorValue"
                  :square="viewport.isLessThan('lg')"
                  :variant="wishlistButtonVariant"
                  class="!m-0 !mb-2"
                >
                  <div>
                    {{
                      !isWishlistItem(productGetters.getVariationId(product))
                        ? t('common.actions.addToWishlist')
                        : t('common.actions.removeFromWishlist')
                    }}
                  </div>
                </WishlistButton>
              </div>
            </template>

            <template v-if="key === 'attributes' && configuration?.fields.attributes">
              <!-- Dorins: Größentabelle rechts neben „Größe“ wie im bisherigen Shop (Position per dorins.css) -->
              <div class="relative" data-testid="attributes-with-size-chart">
                <ProductAttributes :product="product" />
                <NuxtLink
                  :to="localePath('/informationen/groesseninformation')"
                  class="inline-block mt-1 mb-2 typography-text-sm underline"
                  data-testid="size-chart-link"
                >
                  {{ t('dorins.sizeChart') }}
                </NuxtLink>
              </div>
            </template>

            <template v-if="key === 'itemBundle'">
              <BundleOrderItems v-if="product.bundleComponents && showBundleComponents" :product="product" />
            </template>
            <template v-if="key === 'orderProperties' && configuration?.fields.orderProperties">
              <OrderProperties :product="product" />
            </template>
            <template v-if="key === 'graduatedPrices' && configuration?.fields.graduatedPrices">
              <GraduatedPriceList :count="quantitySelectorValue" :product="product" />
            </template>
            <template v-if="key === 'guaranteeLabel' && configuration?.fields.guaranteeLabel">
              <GuaranteeBlock :product="product" max-width="20rem" class="m-4" />
            </template>

            <template v-if="key === 'quantityAndAddToCart' && configuration?.fields.quantityAndAddToCart">
              <UnitContentSelect
                v-if="product && productGetters.possibleUnitCombination(product).length > 1"
                :product="product"
              />
              <div class="mt-4">
                <div class="flex flex-col @md:flex-row flex-wrap gap-4">
                  <UiQuantitySelector
                    v-if="productGetters.isActiveVariationSalable(product)"
                    :min-value="productGetters.getMinimumOrderQuantity(product)"
                    :value="quantitySelectorValue"
                    class="min-w-[145px] flex-grow-0 flex-shrink-0 basis-0"
                    @change-quantity="changeQuantity"
                  />
                  <div
                    v-if="showNotifyMe && !productGetters.isActiveVariationSalable(product)"
                    class="flex-grow-[2] flex-shrink basis-auto whitespace-nowrap"
                  >
                    <NotifyMe :variation-id="Number(productGetters.getVariationId(product))" />
                  </div>
                  <SfTooltip
                    v-else
                    :label="isNotValidVariation || isSalableText"
                    class="flex-grow-[2] flex-shrink basis-auto whitespace-nowrap"
                    placement="top"
                    show-arrow
                  >
                    <UiButton
                      :disabled="loading || !productGetters.isSalable(product)"
                      class="w-full h-full"
                      data-testid="add-to-cart"
                      size="lg"
                      type="submit"
                    >
                      <template #prefix>
                        <!-- Dorins: Text und Warenkorb-Symbol des bisherigen Shops rechts daneben -->
                        <div v-if="!loading" class="flex row items-center gap-3">
                          {{ t('common.actions.addToCart') }}
                          <DorinsIcon name="basket" class="dorins-cart-icon" />
                        </div>
                        <div v-else>
                          <SfLoaderCircular size="sm" />
                        </div>
                      </template>
                    </UiButton>
                  </SfTooltip>
                </div>

                <!-- Dorins: PayPal-Knöpfe direkt unter „In den Warenkorb“ wie im bisherigen Shop -->
                <template v-if="showPayPalButtons">
                  <PayPalExpressButton
                    class="mt-4"
                    location="itemPage"
                    type="SingleItem"
                    @validation-callback="paypalHandleAddToCart"
                  />
                  <PayPalPayLaterBanner
                    :amount="priceWithProperties * quantitySelectorValue"
                    location="itemPage"
                    placement="product"
                  />
                </template>
                <DorinsShippingCountdown :product="product" />
                <!-- Dorins: Merken, Frage per Mail, Telefon wie im bisherigen Shop -->
                <div class="dorins-item-actions" data-testid="dorins-item-actions">
                  <button type="button" :disabled="wishlistLoading" @click="toggleWishlist">
                    <SfIconFavoriteFilled v-if="isWishlistItem(productGetters.getVariationId(product))" size="sm" />
                    <SfIconFavorite v-else size="sm" />
                    {{ t('dorins.rememberItem') }}
                  </button>
                  <a :href="questionMailto"><SfIconEmail size="sm" />{{ t('dorins.askQuestion') }}</a>
                  <a :href="SHOP_PHONE_HREF"><SfIconCall size="sm" />{{ SHOP_PHONE }}</a>
                </div>
              </div>
            </template>

            <template v-if="key === 'itemText' && configuration?.fields.itemText">
              <div
                v-if="productGetters.getDescription(product)"
                class="mb-4 font-normal typography-text-sm whitespace-pre-line break-words no-preflight"
                data-testid="product-description"
                v-html="productGetters.getDescription(product)"
              />
            </template>
            <template v-if="key === 'technicalData' && configuration?.fields.technicalData">
              <div
                v-if="productGetters.getTechnicalData(product)"
                class="mb-4 font-normal typography-text-sm whitespace-pre-line break-words no-preflight"
                data-testid="product-description"
                v-html="productGetters.getTechnicalData(product)"
              />
            </template>
          </template>
        </section>
      </div>
    </div>
  </form>
</template>

<script lang="ts" setup>
import { productGetters, reviewGetters, productBundleGetters } from '@plentymarkets/shop-api';
import {
  SfCounter,
  SfRating,
  SfIconCall,
  SfIconEmail,
  SfIconFavorite,
  SfIconFavoriteFilled,
  SfLoaderCircular,
  SfTooltip,
} from '@storefront-ui/vue';
import type { PriceCardPadding, PriceCardTextBlockItem, PurchaseCardProps } from '~/components/ui/PurchaseCard/types';
import type { PayPalAddToCartCallback } from '#paypal/types';
const isTextBlock = (item: unknown): item is PriceCardTextBlockItem =>
  typeof item === 'object' && item !== null && (item as PriceCardTextBlockItem).type === 'textBlock';

const highlightedUuid = useState<string>('toc-highlighted-uuid', () => '');

const props = withDefaults(defineProps<PurchaseCardProps>(), {
  configuration: () => ({
    fields: {
      itemName: true,
      variationNumber: false,
      price: true,
      tags: true,
      availability: true,
      starRating: true,
      orderProperties: true,
      variationProperties: true,
      previewText: true,
      attributes: true,
      itemBundle: false,
      graduatedPrices: true,
      addToWishlist: true,
      quantityAndAddToCart: true,
      guaranteeLabel: true,
      itemText: false,
      technicalData: false,
    },
    fieldsOrder: [
      'itemName',
      'variationNumber',
      'price',
      'tags',
      'availability',
      'starRating',
      'variationProperties',
      'orderProperties',
      'previewText',
      'attributes',
      'itemBundle',
      'graduatedPrices',
      'addToWishlist',
      'guaranteeLabel',
      'quantityAndAddToCart',
      'itemText',
      'technicalData',
    ],
    fieldsDisabled: ['quantityAndAddToCart', 'price', 'itemBundle', 'attributes'],
    wishlistSize: 'small',

    dropShadow: true,
    borders: true,
    borderColor: '#EFF4F1',
    layout: {
      paddingTop: 0,
      paddingBottom: 0,
      paddingRight: 0,
      paddingLeft: 0,
      fullWidth: false,
    },
  }),
});

const { currentProduct } = useProducts();

const { data: productReviews } = useProductReviews(Number(productGetters.getItemId(currentProduct.value)));
const reviewAverage = computed(() => reviewGetters.getReviewCounts(productReviews.value));

const { getSetting } = useSiteSettings('dontSplitItemBundle');
const showBundleComponents = computed(() => {
  return getSetting() !== '1';
});

const { showNetPrices } = useCart();
const viewport = useViewport();
const { getCombination } = useProductAttributes();
const { getPropertiesForCart, getPropertiesPrice } = useProductOrderProperties();
const { validateAllFields, invalidFields, resetInvalidFields } = useValidatorAggregator('properties');
const {
  validateAllFields: validateAllFieldsAttributes,
  invalidFields: invalidAttributeFields,
  resetInvalidFields: resetAttributeFields,
} = useValidatorAggregator('attributes');
const { clear, send } = useNotification();
const { addToCart, loading } = useCart();
const quantitySelectorValue = ref(productGetters.getMinimumOrderQuantity(props?.product));
const { isWishlistItem, interactWithWishlist, loading: wishlistLoading } = useWishlist();
const { openQuickCheckout } = useQuickCheckout();
const { crossedPrice } = useProductPrice(props?.product);
const { reviewArea } = useProductReviews(Number(productGetters.getId(props?.product)));
const { getBooleanSetting: getNotifyMeSetting } = useSiteSettings('showNotifyMe');
const showNotifyMe = computed(() => getNotifyMeSetting());
const localePath = useLocalePath();

// Marke und Titel wie im bisherigen Shop (gemeinsam mit dem Handy-Titel über dem Bild)
const { brandName, displayName } = useDorinsProductTitle(() => props.product);

const runtimeConfig = useRuntimeConfig();
const brandLogoUrl = computed(() => {
  const manufacturer = productGetters.getManufacturer(props.product) as { logo?: string } | undefined;
  const logo = manufacturer?.logo?.trim();
  if (!logo) return '';
  if (/^https?:\/\//.test(logo)) return encodeURI(logo);
  return encodeURI(`${runtimeConfig.public.domain}${logo.startsWith('/') ? '' : '/'}${logo}`);
});

const SHOP_PHONE = '0351 28708090';
const SHOP_PHONE_HREF = 'tel:+4935128708090';
const SHOP_EMAIL = 'kontakt@dorins-kindermode.de';
const questionMailto = computed(() => {
  const subject = `${t('dorins.askQuestion')}: ${productGetters.getName(props.product)} (${productGetters.getItemId(props.product)})`;
  return `mailto:${SHOP_EMAIL}?subject=${encodeURIComponent(subject)}`;
});
const toggleWishlist = () =>
  interactWithWishlist(productGetters.getVariationId(props.product), quantitySelectorValue.value);

const router = useRouter();
const { resolvePathTrailingSlash } = useUrlTrailingSlash();

const renderTextBlock = (html: string): string =>
  replacePropertyPlaceholdersInHtml(
    localizeHtmlLinks(html, router, localePath, resolvePathTrailingSlash),
    props.product,
  );

const inlineStyle = computed(() => {
  const layout = props?.configuration?.layout || ({} as PriceCardPadding);

  return {
    paddingTop: layout.paddingTop ? `${layout.paddingTop}px` : 0,
    paddingBottom: layout.paddingBottom ? `${layout.paddingBottom}px` : 0,
    paddingLeft: layout.paddingLeft ? `${layout.paddingLeft}px` : 0,
    paddingRight: layout.paddingRight ? `${layout.paddingRight}px` : 0,
    borderColor: props?.configuration?.borderColor || 'transparent',
  };
});

onMounted(() => {
  resetInvalidFields();
  resetAttributeFields();
});

onBeforeRouteLeave(() => {
  if (invalidFields.value.length > 0 || invalidAttributeFields.value.length > 0) clear();
  resetInvalidFields();
  resetAttributeFields();
});

const wishlistButtonVariant = computed(() => {
  return props.configuration?.wishlistSize === 'small' ? 'tertiary' : 'secondary';
});
const priceWithProperties = computed(
  () =>
    (productGetters.getSpecialOffer(props?.product) ||
      productGetters.getGraduatedPriceByQuantity(props?.product, quantitySelectorValue.value)?.unitPrice.value ||
      productGetters.getPrice(props?.product) ||
      0) + getPropertiesPrice(props?.product),
);

const basePriceSingleValue = computed(
  () =>
    productGetters.getGraduatedPriceByQuantity(props?.product, quantitySelectorValue.value)?.basePrice ??
    productGetters.getDefaultBasePrice(props?.product),
);

const handleValidationErrors = (): boolean => {
  send({
    message: [
      t('error.missingOrWrongProperties'),
      '',
      ...invalidAttributeFields.value.map((field) => field.name),
      ...invalidFields.value.map((field) => field.name),
      '',
      t('error.pleaseFillOutAllFields'),
    ],
    type: 'negative',
  });

  return false;
};

const handleAddToCart = async (quickCheckout = true) => {
  await validateAllFieldsAttributes();
  await validateAllFields();

  if (invalidFields.value.length > 0 || invalidAttributeFields.value.length > 0) {
    return handleValidationErrors();
  }

  if (!getCombination()) {
    send({ message: t('product.attributes.notValidVariation'), type: 'negative' });
    return false;
  }

  const addedToCart = await addToCart({
    productId: Number(productGetters.getId(props?.product)),
    quantity: Number(quantitySelectorValue.value),
    basketItemOrderParams: getPropertiesForCart(),
  });

  if (addedToCart) {
    quickCheckout
      ? openQuickCheckout(props?.product, quantitySelectorValue.value)
      : send({ message: t('cart.itemAdded'), type: 'positive' });

    if (getSetting() === '0') {
      send({ message: t('error.notificationsItemBundleSplitted'), type: 'warning' });
    }
  }

  return addedToCart;
};

const paypalHandleAddToCart = async (callback: PayPalAddToCartCallback) => {
  const added = await handleAddToCart(false);

  callback(added);
};

const changeQuantity = (quantity: string) => {
  quantitySelectorValue.value = Number(quantity);
};

const isReviewsAccordionOpen = () => {
  const customerReviewsAccordionDetailsElement = document.querySelector('#customerReviewsAccordion')
    ?.firstChild as HTMLDetailsElement;

  return customerReviewsAccordionDetailsElement.open;
};

const openReviewsAccordion = () => {
  const customerReviewsClickElement = document.querySelector('#customerReviewsClick') as HTMLElement;
  customerReviewsClickElement?.click();
};

const isSalableText = computed(() => (productGetters.isSalable(props?.product) ? '' : t('product.notAvailable')));
const isNotValidVariation = computed(() => (getCombination() ? '' : t('product.attributes.notValidVariation')));
const showPayPalButtons = computed(() => Boolean(getCombination()) && productGetters.isSalable(props?.product));

const scrollToReviews = () => {
  if (!isReviewsAccordionOpen()) {
    openReviewsAccordion();
  }

  if (reviewArea.value) {
    reviewArea.value.scrollIntoView({ behavior: 'smooth' });
  }
};
</script>
