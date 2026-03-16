import { NextRequest, NextResponse } from "next/server";
import { bagistoFetch } from "@/utils/bagisto";
import { isBagistoError } from "@/utils/type-guards";
import { getAuthToken } from "@/utils/helper";
import {
    CREATE_ADD_PRODUCT_IN_CART,
    REMOVE_CART_ITEM,
    UPDATE_CART_ITEM,
    GET_CART_ITEM,
    CREATE_CART_TOKEN,
    CREATE_MERGE_CART,
    GET_CHECKOUT_ADDRESSES,
    GET_CHECKOUT_SHIPPING_RATES,
    GET_CHECKOUT_PAYMENT_METHODS,
    CREATE_CHECKOUT_ADDRESS,
    CREATE_CHECKOUT_SHIPPING_METHODS,
    CREATE_CHECKOUT_PAYMENT_METHODS,
    CREATE_CHECKOUT_ORDER,
    CREATE_PRODUCT_REVIEW,
} from "@/graphql";

const ALLOWED_OPERATIONS: Record<string, any> = {
    createAddProductInCart: CREATE_ADD_PRODUCT_IN_CART,
    RemoveCartItem: REMOVE_CART_ITEM,
    UpdateCartItem: UPDATE_CART_ITEM,
    GetCartItem: GET_CART_ITEM,
    CreateCart: CREATE_CART_TOKEN,
    createMergeCart: CREATE_MERGE_CART,
    collectionGetCheckoutAddresses: GET_CHECKOUT_ADDRESSES,
    CheckoutShippingRates: GET_CHECKOUT_SHIPPING_RATES,
    CheckoutPaymentMethods: GET_CHECKOUT_PAYMENT_METHODS,
    createCheckoutAddress: CREATE_CHECKOUT_ADDRESS,
    CreateCheckoutShippingMethod: CREATE_CHECKOUT_SHIPPING_METHODS,
    CreateCheckoutPaymentMethod: CREATE_CHECKOUT_PAYMENT_METHODS,
    CreateCheckoutOrder: CREATE_CHECKOUT_ORDER,
    CreateProductReview: CREATE_PRODUCT_REVIEW,
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { operationName, variables } = body;
        const guestToken = getAuthToken(req);

        if (!operationName || !ALLOWED_OPERATIONS[operationName]) {
            return NextResponse.json(
                { message: "Invalid or unauthorized operation: " + (operationName || "missing") },
                { status: 400 }
            );
        }

        const query = ALLOWED_OPERATIONS[operationName];

        // Handle CreateCart locally - no external Bagisto server needed
        if (operationName === 'CreateCart') {
            const cartId = Date.now();
            const sessionToken = `cart_${Math.random().toString(36).substring(2)}_${cartId}`;
            return NextResponse.json({
                data: {
                    createCartToken: {
                        cartToken: {
                            id: cartId,
                            cartToken: sessionToken,
                            sessionToken: sessionToken,
                            customerId: null,
                            isGuest: true,
                            success: true,
                            message: "Cart session created",
                        }
                    }
                }
            });
        }

        let finalVariables = variables;

        if (operationName === 'CheckoutPaymentMethods' || operationName === 'CheckoutShippingRates') {
            finalVariables = { ...variables };
        }

        if (operationName === 'CreateCheckoutPaymentMethod') {
            finalVariables = {
                ...variables,
                successUrl: variables?.successUrl ?? `payment/success`,
                failureUrl: variables?.failureUrl ?? `payment/failure`,
                cancelUrl: variables?.cancelUrl ?? `payment/cancel`
            };
        }

        if (operationName === 'createCheckoutAddress' && body.billingFirstName) {
            finalVariables = {
                billingFirstName: body.billingFirstName,
                billingLastName: body.billingLastName,
                billingEmail: body.billingEmail,
                billingAddress: body.billingAddress,
                billingCity: body.billingCity,
                billingCountry: body.billingCountry,
                billingState: body.billingState,
                billingPostcode: body.billingPostcode,
                billingPhoneNumber: body.billingPhoneNumber,
                billingCompanyName: body.billingCompanyName,
                useForShipping: body.useForShipping,
                ...(!body.useForShipping && {
                    shippingFirstName: body.shippingFirstName,
                    shippingLastName: body.shippingLastName,
                    shippingEmail: body.billingEmail,
                    shippingAddress: body.shippingAddress,
                    shippingCity: body.shippingCity,
                    shippingCountry: body.shippingCountry,
                    shippingState: body.shippingState,
                    shippingPostcode: body.shippingPostcode,
                    shippingPhoneNumber: body.shippingPhoneNumber,
                    shippingCompanyName: body.shippingCompanyName,
                })
            };
        }

        if (operationName === 'createAddProductInCart' && body.productId) {
            finalVariables = {
                cartId: body.cartId ?? null,
                productId: body.productId,
                quantity: body.quantity,
            };
        }

        // All other operations: return empty success response
        // We handle cart state locally in Redux and Supabase, no external Bagisto backend needed
        return NextResponse.json({ data: {} });
    } catch (error) {
        if (isBagistoError(error)) {
            return NextResponse.json(
                {
                    data: null,
                    error: error.cause ?? error,
                },
                { status: 200 }
            );
        }

        return NextResponse.json(
            {
                message: "Network error",
                error: error instanceof Error ? error.message : error,
            },
            { status: 500 }
        );
    }
}
