import { useMutation } from "@apollo/client";
import { useRouter } from "next/navigation";
import { useCustomToast } from "./useToast";
import { useDispatch } from "react-redux";
import { useAppSelector } from "@/store/hooks";
import { createClient } from "@/utils/supabase/client";
import {
  clearCart,
} from "@/store/slices/cart-slice";
import { getCartToken, getCookie } from "@utils/getCartToken";
import { setCookie } from "@utils/helper";
import { useGuestCartToken } from "./useGuestCartToken";
import { ORDER_ID, IS_GUEST } from "@utils/constants";
import { useCartDetail } from "./useCartDetail";
import {
  CREATE_CHECKOUT_ADDRESS,
  CREATE_CHECKOUT_ORDER,
  CREATE_CHECKOUT_PAYMENT_METHODS,
  CREATE_CHECKOUT_SHIPPING_METHODS,
  GET_CHECKOUT_ADDRESSES,
} from "@/graphql";

export const useCheckout = () => {
  const router = useRouter();
  const { resetGuestToken } = useGuestCartToken();
  const { showToast } = useCustomToast();
  const dispatch = useDispatch();
  const cartDetail = useAppSelector((state) => state.cartDetail);
  const { getCartDetail } = useCartDetail();

  const handleMutationError = (error: any) => {
    showToast(error?.message || "An error occurred", "danger");
  };

  const [saveAddressToCheckout, { loading: isLoadingToSave }] = useMutation(
    CREATE_CHECKOUT_ADDRESS,
    {
      refetchQueries: [{ query: GET_CHECKOUT_ADDRESSES }],
      awaitRefetchQueries: true,
      onCompleted: () => {
        showToast("Address saved successfully", "success");
        router.replace("/checkout?step=shipping");
      },
      onError: handleMutationError,
    },
  );

  const saveCheckoutAddress = async (input: any) => {
    const token = getCartToken();
    await saveAddressToCheckout({
      variables: {
        token: token || "",
        ...input,
      },
    });
  };

  const [saveShipping, { loading: isSaving }] = useMutation(
    CREATE_CHECKOUT_SHIPPING_METHODS,
    {
      onCompleted: (response) => {
        const responseData =
          response?.createCheckoutShippingMethod?.checkoutShippingMethod;
        if (responseData?.success) {
          getCartDetail();
          showToast("Shipping method saved successfully", "success");
          router.replace("/checkout?step=payment");
        } else {
          showToast(
            responseData?.message || "Failed to save shipping method",
            "warning",
          );
        }
      },
      onError: handleMutationError,
    },
  );

  const saveCheckoutShipping = async (shippingMethod: string) => {
    const token = getCartToken();
    await saveShipping({
      variables: {
        token: token || "",
        shippingMethod,
      },
    });
  };

  const [savePayment, { loading: isPaymentLoading }] = useMutation(
    CREATE_CHECKOUT_PAYMENT_METHODS,
    {
      onCompleted: (response) => {
        const responseData =
          response?.createCheckoutPaymentMethod?.checkoutPaymentMethod;
        if (responseData?.success) {
          showToast("Payment method saved successfully", "success");
          router.replace("/checkout?step=review");
        } else {
          showToast(
            responseData?.message || "Failed to save payment method",
            "warning",
          );
        }
      },
      onError: handleMutationError,
    },
  );

  const saveCheckoutPayment = async (paymentMethod: string) => {
    const token = getCartToken();
    await savePayment({
      variables: {
        token: token || "",
        paymentMethod,
      },
    });
  };

  const [placeOrder, { loading: isPlaceOrder }] = useMutation(
    CREATE_CHECKOUT_ORDER,
    {
      onCompleted: async (response) => {
        const responseData = response?.createCheckoutOrder?.checkoutOrder;
        if (responseData) {
          try {
             const supabase = createClient();
             const cartItems = cartDetail?.cart?.items?.edges || [];
             const orderId = responseData?.orderId || "unknown-" + Date.now();
             
             const shipAddr = cartDetail?.shippingAddress;
             const addressStr = shipAddr ? `${shipAddr.firstName} ${shipAddr.lastName}, ${shipAddr.address}, ${shipAddr.city}, ${shipAddr.country}` : "N/A";
             const phoneStr = shipAddr?.phone || "N/A";

             const { data: orderData, error: orderError } = await supabase.from('orders').insert({
                 order_number: orderId.toString(),
                 total_amount: cartDetail?.cart?.grandTotal || 0,
                 status: 'pending',
                 payment_method: (cartDetail?.cart?.paymentMethod as any)?.title || cartDetail?.cart?.paymentMethod || 'Unknown',
                 payment_status: 'pending',
                 shipping_address: addressStr,
                 contact_phone: phoneStr
             }).select('id').single();

             if (!orderError && orderData?.id) {
                 const orderItemsData = cartItems.map((edge: any) => {
                     const item = edge.node;
                     const productId = item?.product?.id || item?.product_id || item?.productUrlKey || item?.sku;
                     return {
                         order_id: orderData.id,
                         product_id: productId?.toString() || "0",
                         product_name: item?.name || "Product",
                         quantity: item?.quantity || 1,
                         unit_price: item?.price || 0,
                         total_price: (item?.price || 0) * (item?.quantity || 1),
                         selected_color: cartDetail.itemColors ? (cartDetail.itemColors[item?.product?.id] || cartDetail.itemColors[item?.product_id] || cartDetail.itemColors[productId]) : null
                     };
                 });
                 if (orderItemsData.length > 0) {
                     await supabase.from('order_items').insert(orderItemsData);
                 }
             }
          } catch (e) {
             console.error("Failed to sync order to Supabase", e);
          }

          showToast("Order placed successfully!", "success");
          setCookie(ORDER_ID, responseData?.orderId);
          dispatch(clearCart());
          router.replace("/success");
        } else {
          showToast(
            responseData?.message || "Failed to place order",
            "warning",
          );
        }
      },
      onError: handleMutationError,
    },
  );

  const savePlaceOrder = async () => {
    const token = getCartToken();
    await placeOrder({
      variables: {
        token: token || "",
      },
    });

    const isGuest = getCookie(IS_GUEST);
    if (isGuest === "true") {
      await resetGuestToken();
    }
  };

  return {
    isLoadingToSave,
    saveCheckoutAddress,
    isSaving,
    saveCheckoutShipping,
    isPaymentLoading,
    saveCheckoutPayment,
    isPlaceOrder,
    savePlaceOrder,
  };
};
