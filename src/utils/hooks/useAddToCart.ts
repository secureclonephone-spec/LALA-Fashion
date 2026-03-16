import { useCustomToast } from "./useToast";
import { useAppDispatch } from "@/store/hooks";
import { addItem, clearCart, setItemColor } from "@/store/slices/cart-slice";
import { isObject } from "@utils/type-guards";
import { getCartToken, getCookie } from "@utils/getCartToken";
import { useGuestCartToken } from "./useGuestCartToken";
import { IS_GUEST } from "@/utils/constants";
import { useMutation } from "@apollo/client";
import {
  REMOVE_CART_ITEM,
  UPDATE_CART_ITEM,
} from "@/graphql";




export const useAddProduct = () => {
  const dispatch = useAppDispatch();
  const { createGuestToken, resetGuestToken } = useGuestCartToken();
  const { showToast } = useCustomToast();
  const isCartLoading = false;

  const onAddToCart = async ({
    productId,
    quantity,
    selectedColor,
  }: {
    productId: string;
    quantity: number;
    token?: string;
    cartId?: number | string;
    selectedColor?: string;
  }) => {
    // Generate a local session token if needed
    let token = getCartToken();
    if (!token) {
      try {
        token = await createGuestToken();
      } catch (e) {
        token = `local_cart_${Date.now()}`;
      }
    }

    if (selectedColor) {
      dispatch(setItemColor({ productId: productId.toString(), color: selectedColor }));
    }

    // Fetch product details from Supabase to build proper cart shape
    let productName = "Product";
    let productPrice = 0;
    let productImage = "";
    let productSku = "";
    let productSlug = productId;

    try {
      const res = await fetch(`/api/product-details?id=${productId}`);
      if (res.ok) {
        const { product } = await res.json();
        if (product) {
          productName = product.name || "Product";
          productPrice = product.sale_price || product.mrp || 0;
          productImage = product.image_url || "";
          productSku = product.sku || productId;
          productSlug = product.slug || productId;
        }
      }
    } catch (e) {
      console.error("Error fetching product details for cart:", e);
    }

    const subtotal = productPrice * quantity;

    const cartItem = {
      id: Date.now(),
      itemsQty: quantity,
      subtotal: subtotal,
      grandTotal: subtotal,
      taxAmount: 0,
      shippingAmount: 0,
      paymentMethod: "",
      paymentMethodTitle: "",
      shippingMethod: "",
      selectedShippingRate: "",
      selectedShippingRateTitle: "",
      items: {
        edges: [
          {
            node: {
              id: productId,
              name: productName,
              sku: productSku,
              productUrlKey: productSlug,
              quantity: quantity,
              price: productPrice,
              baseImage: JSON.stringify({ small_image_url: productImage }),
              product: { id: productId },
              product_id: productId,
            },
          },
        ],
      },
    };

    dispatch(addItem(cartItem as any));
    showToast("Product added to cart successfully", "success");

    return true;
  };

  //--------Remove Cart Product Quantity--------//
  const [removeFromCart, { loading: isRemoveLoading }] = useMutation(
    REMOVE_CART_ITEM,
    {
      onCompleted: async (response) => {
        const responseData = response?.createRemoveCartItem?.removeCartItem;
        if (isObject(responseData)) {
          const message = "Cart item removed successfully";
          dispatch(addItem(responseData as any));
          showToast(message as string, "warning");

          if (!responseData?.itemsQty) {
            dispatch(clearCart());

            const isGuest = getCookie(IS_GUEST);
            if (isGuest === "true") {
              resetGuestToken();
            }
          }
        } else {
          showToast("Something went wrong", "warning");
        }
      },
      onError: (error) => {
        showToast(error?.message as string, "danger");
      },
    },
  );

  const onAddToRemove = async (productId: string) => {
    await removeFromCart({
      variables: {
        cartItemId: parseInt(productId),
      },
    });
  };

  //---------Update Cart Product Quantity--------//
  const [updateCartItem, { loading: isUpdateLoading }] = useMutation(
    UPDATE_CART_ITEM,
    {
      onCompleted: (response: any) => {
        const responseData = response?.createUpdateCartItem?.updateCartItem;

        if (isObject(responseData)) {
          dispatch(addItem(responseData as any));
        } else {
          showToast("Something went wrong!", "warning");
        }
      },

      onError: (error) => {
        showToast(error?.message as string, "danger");
      },
    },
  );

  const onUpdateCart = async ({
    cartItemId,
    quantity,
  }: {
    cartItemId: number;
    quantity: number;
  }) => {
    if (quantity < 1) {
      showToast("Quantity must be at least 1", "warning");
      return;
    }

    await updateCartItem({
      variables: {
        cartItemId: cartItemId,
        quantity,
      },
    });
  };

  return {
    isCartLoading,
    onAddToCart,
    isRemoveLoading,
    onAddToRemove,
    onUpdateCart,
    isUpdateLoading,
  };
};
