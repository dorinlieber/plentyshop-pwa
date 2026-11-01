<template>
  <UiButton
    :variant="variant"
    size="sm"
    :aria-label="
      isWishlistItem(variationId)
        ? t('common.actions.removeProductFromWishlist', { label: productName })
        : t('common.actions.addProductToWishlist', { label: productName })
    "
    :class="{ 'p-[0.5rem]': !isCloseButton }"
    class="m-2"
    :disabled="wishlistLoading"
    data-testid="wishlist-trigger"
    @click="onWishlistClick"
  >
    <SfLoaderCircular v-if="actionLoading" class="flex justify-center items-center" size="sm" />
    <template v-else>
      <SfIconClose v-if="isCloseButton" size="sm" />
      <svg
        v-else-if="ltsHeart"
        class="dorins-wish-heart"
        :class="{ 'dorins-wish-heart--active': isWishlistItem(variationId) }"
        viewBox="0 0 18.072 16.104"
        aria-hidden="true"
      >
        <path
          d="M-211.921,350.189c-.078,0-.173,0-.254.009a3.715,3.715,0,0,0-3.422,2.762c-1.613,5.143,6.343,10.917,8.273,12.226,1.922-1.306,9.885-7.083,8.307-12.111l-.021-.072a3.732,3.732,0,0,0-3.385-2.8,2.339,2.339,0,0,0-.26-.011,5,5,0,0,0-3.471,1.421l-1.17,1.135-1.168-1.136A4.965,4.965,0,0,0-211.921,350.189Z"
          transform="translate(216.348 -349.688)"
        />
      </svg>
      <SfIconFavoriteFilled v-else-if="isWishlistItem(variationId)" size="sm" />
      <SfIconFavorite v-else size="sm" />
      <slot />
    </template>
  </UiButton>
</template>

<script setup lang="ts">
import type { WishlistButtonProps } from '~/components/WishlistButton/types';
import { SfIconFavorite, SfIconFavoriteFilled, SfLoaderCircular, SfIconClose } from '@storefront-ui/vue';
import { productGetters } from '@plentymarkets/shop-api';

const {
  product,
  quantity = 1,
  discard = false,
  variant = 'tertiary',
  ltsHeart = false,
} = defineProps<WishlistButtonProps>();
const { isWishlistItem, interactWithWishlist, loading: wishlistLoading } = useWishlist();
const actionLoading = ref(false);

const productName = computed(() => productGetters.getName(product));
const variationId = computed(() => productGetters.getVariationId(product));
const isCloseButton = computed(() => isWishlistItem(variationId.value) && discard);
const onWishlistClick = async () => {
  actionLoading.value = true;
  await interactWithWishlist(variationId.value, quantity);
  actionLoading.value = false;
};
</script>
