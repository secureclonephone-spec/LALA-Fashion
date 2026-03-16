"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useCallback, useRef } from "react";

export function useCartDetail() {
  const cart = useAppSelector((state) => state.cartDetail.cart);
  const hasItems = Array.isArray((cart as any)?.items?.edges) && (cart as any)?.items?.edges.length > 0;

  // Skip fetching - we already have cart data from Buy Now dispatch
  const getCartDetail = useCallback(async () => {
    // Cart is managed locally in Redux - no external fetch needed
  }, []);

  return {
    cartData: cart,
    getCartDetail,
    isLoading: false,
    error: null,
  };
}
