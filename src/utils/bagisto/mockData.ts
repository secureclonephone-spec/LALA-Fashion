// ─── Per-product detail lookup (keyed by urlKey) ─────────────────────────────
const baseProducts = [
    {
        id: "prod_1",
        sku: "mock-product-1",
        type: "simple",
        name: "Rustic Wood Coffee Table",
        urlKey: "rustic-wood-coffee-table",
        description: "<p>A beautifully crafted rustic wood coffee table that adds warmth and character to any living space. Made from solid reclaimed timber with a natural finish that highlights the wood's unique grain patterns.</p>",
        shortDescription: "Solid reclaimed timber coffee table with natural finish.",
        price: 180.0,
        baseImageUrl: "/images/76ziI3GsYbKMvbDe5lbMOKiDPpsBfj0Dsae2MJJ3.webp",
        minimumPrice: 180.0,
        specialPrice: null,
        isSaleable: true,
        variants: { edges: [] },
        reviews: { edges: [] },
        relatedProducts: {
            edges: [
                { node: { id: "prod_2", sku: "mock-product-2", type: "simple", name: "Modern Lounge Chair", price: 250.0, urlKey: "modern-lounge-chair", baseImageUrl: "/images/915KzWNBIiVMZMyzMX5Dd71ZiPdnkdszRe5Ghknx.webp", minimumPrice: 250.0, specialPrice: 199.99, isSaleable: true } },
                { node: { id: "prod_3", sku: "mock-product-3", type: "simple", name: "Casual Green Sweater", price: 45.0, urlKey: "casual-green-sweater", baseImageUrl: "/images/AA1X8qJMtgi3HKHGiwmV1LEPFrQk6Z8aYPc137Y0.webp", minimumPrice: 45.0, specialPrice: null, isSaleable: true } },
                { node: { id: "prod_6", sku: "mock-product-6", type: "simple", name: "Premium Coffee Maker", price: 150.0, urlKey: "premium-coffee-maker", baseImageUrl: "/images/G4VN3pCRrL4cpzv1G56eEpAoYM2WvtjMRaTia8DO.webp", minimumPrice: 150.0, specialPrice: null, isSaleable: true } },
                { node: { id: "prod_7", sku: "mock-product-7", type: "simple", name: "Smart Watch Series 8", price: 399.0, urlKey: "smart-watch-series-8", baseImageUrl: "/images/GMrmn8hk6KFToRnoBRSHysA40NyOEPne4iuJaaFP.webp", minimumPrice: 399.0, specialPrice: 349.0, isSaleable: true } },
            ]
        },
        superAttributeOptions: null,
        combinations: null,
        attributeValues: { edges: [] },
        superAttributes: { edges: [] },
        orderCount: 154,
        quickAttributes: [
            { label: "Made in", value: "Australia" },
            { label: "Design", value: "Modern" },
            { label: "Delivery", value: "2 days delivery", highlight: true },
        ],
    },
    {
        id: "prod_2",
        sku: "mock-product-2",
        type: "simple",
        name: "Modern Lounge Chair",
        urlKey: "modern-lounge-chair",
        description: "<p>Sink into luxury with this modern lounge chair, upholstered in premium fabric with solid wood legs. Ergonomically designed for maximum comfort — perfect for your reading nook or living room.</p>",
        shortDescription: "Premium upholstered lounge chair with solid wood legs.",
        price: 250.0,
        baseImageUrl: "/images/915KzWNBIiVMZMyzMX5Dd71ZiPdnkdszRe5Ghknx.webp",
        minimumPrice: 250.0,
        specialPrice: 199.99,
        isSaleable: true,
        variants: { edges: [] },
        reviews: { edges: [] },
        relatedProducts: {
            edges: [
                { node: { id: "prod_1", sku: "mock-product-1", type: "simple", name: "Rustic Wood Coffee Table", price: 180.0, urlKey: "rustic-wood-coffee-table", baseImageUrl: "/images/76ziI3GsYbKMvbDe5lbMOKiDPpsBfj0Dsae2MJJ3.webp", minimumPrice: 180.0, specialPrice: null, isSaleable: true } },
                { node: { id: "prod_4", sku: "mock-product-4", type: "simple", name: "Contemporary White Top", price: 35.0, urlKey: "contemporary-white-top", baseImageUrl: "/images/FFHxE9HE2Ezt9aqvr6s3fPPCc1nrjwMNna1o1wTQ.webp", minimumPrice: 35.0, specialPrice: null, isSaleable: true } },
                { node: { id: "prod_5", sku: "mock-product-5", type: "simple", name: "Minimalist Yellow Shirt", price: 25.0, urlKey: "minimalist-yellow-shirt", baseImageUrl: "/images/Fi03jjWdNqXYL9nhomSuSvBBFHFdUWWvu5i73mlX.webp", minimumPrice: 25.0, specialPrice: null, isSaleable: true } },
                { node: { id: "prod_8", sku: "mock-product-8", type: "simple", name: "Wireless Headphones Pro", price: 199.0, urlKey: "wireless-headphones-pro", baseImageUrl: "/images/GgVb64280ueUvsufBjCaQAfs7hlVyBcv3igpfjrO.webp", minimumPrice: 199.0, specialPrice: null, isSaleable: true } },
            ]
        },
        superAttributeOptions: null,
        combinations: null,
        attributeValues: { edges: [] },
        superAttributes: { edges: [] },
        orderCount: 98,
        quickAttributes: [
            { label: "Made in", value: "Italy" },
            { label: "Design", value: "Contemporary" },
            { label: "Delivery", value: "3 days delivery", highlight: true },
        ],
    },
    {
        id: "prod_3",
        sku: "mock-product-3",
        type: "simple",
        name: "Casual Green Sweater",
        urlKey: "casual-green-sweater",
        description: "<p>Stay cozy and stylish with this casual green sweater made from 100% organic cotton. Featuring a relaxed fit and ribbed cuffs, this versatile piece pairs perfectly with jeans or joggers.</p>",
        shortDescription: "100% organic cotton relaxed-fit sweater in forest green.",
        price: 45.0,
        baseImageUrl: "/images/AA1X8qJMtgi3HKHGiwmV1LEPFrQk6Z8aYPc137Y0.webp",
        minimumPrice: 45.0,
        specialPrice: null,
        isSaleable: true,
        variants: { edges: [] },
        reviews: { edges: [] },
        relatedProducts: {
            edges: [
                { node: { id: "prod_4", sku: "mock-product-4", type: "simple", name: "Contemporary White Top", price: 35.0, urlKey: "contemporary-white-top", baseImageUrl: "/images/FFHxE9HE2Ezt9aqvr6s3fPPCc1nrjwMNna1o1wTQ.webp", minimumPrice: 35.0, specialPrice: null, isSaleable: true } },
                { node: { id: "prod_5", sku: "mock-product-5", type: "simple", name: "Minimalist Yellow Shirt", price: 25.0, urlKey: "minimalist-yellow-shirt", baseImageUrl: "/images/Fi03jjWdNqXYL9nhomSuSvBBFHFdUWWvu5i73mlX.webp", minimumPrice: 25.0, specialPrice: null, isSaleable: true } },
                { node: { id: "prod_7", sku: "mock-product-7", type: "simple", name: "Smart Watch Series 8", price: 399.0, urlKey: "smart-watch-series-8", baseImageUrl: "/images/GMrmn8hk6KFToRnoBRSHysA40NyOEPne4iuJaaFP.webp", minimumPrice: 399.0, specialPrice: 349.0, isSaleable: true } },
                { node: { id: "prod_8", sku: "mock-product-8", type: "simple", name: "Wireless Headphones Pro", price: 199.0, urlKey: "wireless-headphones-pro", baseImageUrl: "/images/GgVb64280ueUvsufBjCaQAfs7hlVyBcv3igpfjrO.webp", minimumPrice: 199.0, specialPrice: null, isSaleable: true } },
            ]
        },
        superAttributeOptions: null,
        combinations: null,
        attributeValues: { edges: [] },
        superAttributes: { edges: [] },
        orderCount: 213,
        quickAttributes: [
            { label: "Made in", value: "Pakistan" },
            { label: "Material", value: "Organic Cotton" },
            { label: "Delivery", value: "2 days delivery", highlight: true },
        ],
    },
    {
        id: "prod_4",
        sku: "mock-product-4",
        type: "simple",
        name: "Contemporary White Top",
        urlKey: "contemporary-white-top",
        description: "<p>A clean, minimalist white top that serves as the perfect building block for any wardrobe. Crafted from breathable lightweight fabric with a modern cut that flatters all body types.</p>",
        shortDescription: "Clean minimalist white top in breathable lightweight fabric.",
        price: 35.0,
        baseImageUrl: "/images/FFHxE9HE2Ezt9aqvr6s3fPPCc1nrjwMNna1o1wTQ.webp",
        minimumPrice: 35.0,
        specialPrice: null,
        isSaleable: true,
        variants: { edges: [] },
        reviews: { edges: [] },
        relatedProducts: {
            edges: [
                { node: { id: "prod_3", sku: "mock-product-3", type: "simple", name: "Casual Green Sweater", price: 45.0, urlKey: "casual-green-sweater", baseImageUrl: "/images/AA1X8qJMtgi3HKHGiwmV1LEPFrQk6Z8aYPc137Y0.webp", minimumPrice: 45.0, specialPrice: null, isSaleable: true } },
                { node: { id: "prod_5", sku: "mock-product-5", type: "simple", name: "Minimalist Yellow Shirt", price: 25.0, urlKey: "minimalist-yellow-shirt", baseImageUrl: "/images/Fi03jjWdNqXYL9nhomSuSvBBFHFdUWWvu5i73mlX.webp", minimumPrice: 25.0, specialPrice: null, isSaleable: true } },
                { node: { id: "prod_6", sku: "mock-product-6", type: "simple", name: "Premium Coffee Maker", price: 150.0, urlKey: "premium-coffee-maker", baseImageUrl: "/images/G4VN3pCRrL4cpzv1G56eEpAoYM2WvtjMRaTia8DO.webp", minimumPrice: 150.0, specialPrice: null, isSaleable: true } },
                { node: { id: "prod_8", sku: "mock-product-8", type: "simple", name: "Wireless Headphones Pro", price: 199.0, urlKey: "wireless-headphones-pro", baseImageUrl: "/images/GgVb64280ueUvsufBjCaQAfs7hlVyBcv3igpfjrO.webp", minimumPrice: 199.0, specialPrice: null, isSaleable: true } },
            ]
        },
        superAttributeOptions: null,
        combinations: null,
        attributeValues: { edges: [] },
        superAttributes: { edges: [] },
        orderCount: 76,
        quickAttributes: [
            { label: "Made in", value: "Bangladesh" },
            { label: "Design", value: "Minimalist" },
            { label: "Delivery", value: "2 days delivery", highlight: true },
        ],
    },
    {
        id: "prod_5",
        sku: "mock-product-5",
        type: "simple",
        name: "Minimalist Yellow Shirt",
        urlKey: "minimalist-yellow-shirt",
        description: "<p>Bright, breezy, and effortlessly cool — this minimalist yellow shirt will quickly become your go-to warm-weather essential. The soft cotton blend ensures all-day comfort while the relaxed fit keeps things casual.</p>",
        shortDescription: "Soft cotton-blend relaxed-fit shirt in sunshine yellow.",
        price: 25.0,
        baseImageUrl: "/images/Fi03jjWdNqXYL9nhomSuSvBBFHFdUWWvu5i73mlX.webp",
        minimumPrice: 25.0,
        specialPrice: null,
        isSaleable: true,
        variants: { edges: [] },
        reviews: { edges: [] },
        relatedProducts: {
            edges: [
                { node: { id: "prod_3", sku: "mock-product-3", type: "simple", name: "Casual Green Sweater", price: 45.0, urlKey: "casual-green-sweater", baseImageUrl: "/images/AA1X8qJMtgi3HKHGiwmV1LEPFrQk6Z8aYPc137Y0.webp", minimumPrice: 45.0, specialPrice: null, isSaleable: true } },
                { node: { id: "prod_4", sku: "mock-product-4", type: "simple", name: "Contemporary White Top", price: 35.0, urlKey: "contemporary-white-top", baseImageUrl: "/images/FFHxE9HE2Ezt9aqvr6s3fPPCc1nrjwMNna1o1wTQ.webp", minimumPrice: 35.0, specialPrice: null, isSaleable: true } },
                { node: { id: "prod_7", sku: "mock-product-7", type: "simple", name: "Smart Watch Series 8", price: 399.0, urlKey: "smart-watch-series-8", baseImageUrl: "/images/GMrmn8hk6KFToRnoBRSHysA40NyOEPne4iuJaaFP.webp", minimumPrice: 399.0, specialPrice: 349.0, isSaleable: true } },
                { node: { id: "prod_8", sku: "mock-product-8", type: "simple", name: "Wireless Headphones Pro", price: 199.0, urlKey: "wireless-headphones-pro", baseImageUrl: "/images/GgVb64280ueUvsufBjCaQAfs7hlVyBcv3igpfjrO.webp", minimumPrice: 199.0, specialPrice: null, isSaleable: true } },
            ]
        },
        superAttributeOptions: null,
        combinations: null,
        attributeValues: { edges: [] },
        superAttributes: { edges: [] },
        orderCount: 341,
        quickAttributes: [
            { label: "Made in", value: "Turkey" },
            { label: "Design", value: "Casual" },
            { label: "Delivery", value: "1 day delivery", highlight: true },
        ],
    },
    {
        id: "prod_6",
        sku: "mock-product-6",
        type: "simple",
        name: "Premium Coffee Maker",
        urlKey: "premium-coffee-maker",
        description: "<p>Start your mornings right with this premium coffee maker featuring a 12-cup capacity, built-in grinder, programmable timer, and thermal carafe to keep your brew hot for hours. Barista-quality coffee from the comfort of your home.</p>",
        shortDescription: "12-cup programmable coffee maker with built-in grinder and thermal carafe.",
        price: 150.0,
        baseImageUrl: "/images/G4VN3pCRrL4cpzv1G56eEpAoYM2WvtjMRaTia8DO.webp",
        minimumPrice: 150.0,
        specialPrice: null,
        isSaleable: true,
        variants: { edges: [] },
        reviews: { edges: [] },
        relatedProducts: {
            edges: [
                { node: { id: "prod_1", sku: "mock-product-1", type: "simple", name: "Rustic Wood Coffee Table", price: 180.0, urlKey: "rustic-wood-coffee-table", baseImageUrl: "/images/76ziI3GsYbKMvbDe5lbMOKiDPpsBfj0Dsae2MJJ3.webp", minimumPrice: 180.0, specialPrice: null, isSaleable: true } },
                { node: { id: "prod_7", sku: "mock-product-7", type: "simple", name: "Smart Watch Series 8", price: 399.0, urlKey: "smart-watch-series-8", baseImageUrl: "/images/GMrmn8hk6KFToRnoBRSHysA40NyOEPne4iuJaaFP.webp", minimumPrice: 399.0, specialPrice: 349.0, isSaleable: true } },
                { node: { id: "prod_8", sku: "mock-product-8", type: "simple", name: "Wireless Headphones Pro", price: 199.0, urlKey: "wireless-headphones-pro", baseImageUrl: "/images/GgVb64280ueUvsufBjCaQAfs7hlVyBcv3igpfjrO.webp", minimumPrice: 199.0, specialPrice: null, isSaleable: true } },
                { node: { id: "prod_2", sku: "mock-product-2", type: "simple", name: "Modern Lounge Chair", price: 250.0, urlKey: "modern-lounge-chair", baseImageUrl: "/images/915KzWNBIiVMZMyzMX5Dd71ZiPdnkdszRe5Ghknx.webp", minimumPrice: 250.0, specialPrice: 199.99, isSaleable: true } },
            ]
        },
        superAttributeOptions: null,
        combinations: null,
        attributeValues: { edges: [] },
        superAttributes: { edges: [] },
        orderCount: 527,
        quickAttributes: [
            { label: "Made in", value: "Germany" },
            { label: "Type", value: "Drip Coffee Maker" },
            { label: "Delivery", value: "2 days delivery", highlight: true },
        ],
    },
    {
        id: "prod_7",
        sku: "mock-product-7",
        type: "simple",
        name: "Smart Watch Series 8",
        urlKey: "smart-watch-series-8",
        description: "<p>The Smart Watch Series 8 redefines wearable technology. With an always-on retina display, health monitoring (heart rate, SpO2, sleep tracking), GPS, and 18-hour battery life — this watch keeps up with every aspect of your lifestyle.</p>",
        shortDescription: "Advanced smartwatch with health monitoring, GPS, and 18-hour battery.",
        price: 399.0,
        baseImageUrl: "/images/GMrmn8hk6KFToRnoBRSHysA40NyOEPne4iuJaaFP.webp",
        minimumPrice: 399.0,
        specialPrice: 349.0,
        isSaleable: true,
        variants: { edges: [] },
        reviews: { edges: [] },
        relatedProducts: {
            edges: [
                { node: { id: "prod_8", sku: "mock-product-8", type: "simple", name: "Wireless Headphones Pro", price: 199.0, urlKey: "wireless-headphones-pro", baseImageUrl: "/images/GgVb64280ueUvsufBjCaQAfs7hlVyBcv3igpfjrO.webp", minimumPrice: 199.0, specialPrice: null, isSaleable: true } },
                { node: { id: "prod_6", sku: "mock-product-6", type: "simple", name: "Premium Coffee Maker", price: 150.0, urlKey: "premium-coffee-maker", baseImageUrl: "/images/G4VN3pCRrL4cpzv1G56eEpAoYM2WvtjMRaTia8DO.webp", minimumPrice: 150.0, specialPrice: null, isSaleable: true } },
                { node: { id: "prod_1", sku: "mock-product-1", type: "simple", name: "Rustic Wood Coffee Table", price: 180.0, urlKey: "rustic-wood-coffee-table", baseImageUrl: "/images/76ziI3GsYbKMvbDe5lbMOKiDPpsBfj0Dsae2MJJ3.webp", minimumPrice: 180.0, specialPrice: null, isSaleable: true } },
                { node: { id: "prod_2", sku: "mock-product-2", type: "simple", name: "Modern Lounge Chair", price: 250.0, urlKey: "modern-lounge-chair", baseImageUrl: "/images/915KzWNBIiVMZMyzMX5Dd71ZiPdnkdszRe5Ghknx.webp", minimumPrice: 250.0, specialPrice: 199.99, isSaleable: true } },
            ]
        },
        superAttributeOptions: null,
        combinations: null,
        attributeValues: { edges: [] },
        superAttributes: { edges: [] },
        orderCount: 892,
        quickAttributes: [
            { label: "Made in", value: "South Korea" },
            { label: "Display", value: "Always-On Retina" },
            { label: "Delivery", value: "Same day delivery", highlight: true },
        ],
    },
    {
        id: "prod_8",
        sku: "mock-product-8",
        type: "simple",
        name: "Wireless Headphones Pro",
        urlKey: "wireless-headphones-pro",
        description: "<p>Immerse yourself in crystal-clear audio with the Wireless Headphones Pro. Featuring active noise cancellation, 30-hour battery life, premium 40mm drivers, and a foldable design — perfect for commuting, travel, or focus sessions at home.</p>",
        shortDescription: "ANC wireless headphones with 30-hour battery and premium 40mm drivers.",
        price: 199.0,
        baseImageUrl: "/images/GgVb64280ueUvsufBjCaQAfs7hlVyBcv3igpfjrO.webp",
        minimumPrice: 199.0,
        specialPrice: null,
        isSaleable: true,
        variants: { edges: [] },
        reviews: { edges: [] },
        relatedProducts: {
            edges: [
                { node: { id: "prod_7", sku: "mock-product-7", type: "simple", name: "Smart Watch Series 8", price: 399.0, urlKey: "smart-watch-series-8", baseImageUrl: "/images/GMrmn8hk6KFToRnoBRSHysA40NyOEPne4iuJaaFP.webp", minimumPrice: 399.0, specialPrice: 349.0, isSaleable: true } },
                { node: { id: "prod_6", sku: "mock-product-6", type: "simple", name: "Premium Coffee Maker", price: 150.0, urlKey: "premium-coffee-maker", baseImageUrl: "/images/G4VN3pCRrL4cpzv1G56eEpAoYM2WvtjMRaTia8DO.webp", minimumPrice: 150.0, specialPrice: null, isSaleable: true } },
                { node: { id: "prod_3", sku: "mock-product-3", type: "simple", name: "Casual Green Sweater", price: 45.0, urlKey: "casual-green-sweater", baseImageUrl: "/images/AA1X8qJMtgi3HKHGiwmV1LEPFrQk6Z8aYPc137Y0.webp", minimumPrice: 45.0, specialPrice: null, isSaleable: true } },
                { node: { id: "prod_4", sku: "mock-product-4", type: "simple", name: "Contemporary White Top", price: 35.0, urlKey: "contemporary-white-top", baseImageUrl: "/images/FFHxE9HE2Ezt9aqvr6s3fPPCc1nrjwMNna1o1wTQ.webp", minimumPrice: 35.0, specialPrice: null, isSaleable: true } },
            ]
        },
        superAttributeOptions: null,
        combinations: null,
        attributeValues: { edges: [] },
        superAttributes: { edges: [] },
        orderCount: 1204,
        quickAttributes: [
            { label: "Made in", value: "Japan" },
            { label: "Driver", value: "40mm Premium" },
            { label: "Delivery", value: "Next day delivery", highlight: true },
        ],
    },
];

/**
 * Lookup map for single product detail by urlKey.
 * Used by GetProductById and ProductSwatchReview queries.
 */
export const MockProductByUrlKey: Record<string, (typeof baseProducts)[0]> =
    Object.fromEntries(baseProducts.map((p) => [p.urlKey, p]));

/**
 * Empty reviews mock — used by GetProductReviews query.
 */
export const MockProductReviews = { productReviews: { edges: [] } };

// ─────────────────────────────────────────────────────────────────────────────

export const MockThemeCustomizationResponse = {
    themeCustomizations: {
        edges: [
            {
                node: {
                    id: "1",
                    type: "image_carousel",
                    name: "Hero Carousel",
                    status: "1",
                    sortOrder: 1,
                    translations: {
                        edges: [
                            {
                                node: {
                                    id: "t1",
                                    themeCustomizationId: "1",
                                    locale: "en",
                                    options: JSON.stringify({
                                        images: [
                                            {
                                                title: "FASHION SALE",
                                                link: "#",
                                                image: "/images/0MOaopD9vZFAAPbQVNbhQH8K7wBl4WVVFaSjrXIU.webp",
                                            },
                                        ],
                                    }),
                                },
                            },
                        ],
                    },
                },
            },
            {
                node: {
                    id: "2",
                    type: "product_carousel",
                    name: "Featured Products",
                    status: "1",
                    sortOrder: 2,
                    translations: {
                        edges: [
                            {
                                node: {
                                    id: "t2",
                                    themeCustomizationId: "2",
                                    locale: "en",
                                    options: JSON.stringify({
                                        title: "Featured Products",
                                        filters: { limit: "3" },
                                    }),
                                },
                            },
                        ],
                    },
                },
            },
            {
                node: {
                    id: "3",
                    type: "category_carousel",
                    name: "Shop by Category",
                    status: "1",
                    sortOrder: 3,
                    translations: {
                        edges: [
                            {
                                node: {
                                    id: "t3",
                                    themeCustomizationId: "3",
                                    locale: "en",
                                    options: JSON.stringify({
                                        filters: { limit: "3" },
                                    }),
                                },
                            },
                        ],
                    },
                },
            },
            {
                node: {
                    id: "4",
                    type: "product_carousel",
                    name: "New Products",
                    status: "1",
                    sortOrder: 4,
                    translations: {
                        edges: [
                            {
                                node: {
                                    id: "t4",
                                    themeCustomizationId: "4",
                                    locale: "en",
                                    options: JSON.stringify({
                                        title: "New Products",
                                        filters: { limit: "8" },
                                    }),
                                },
                            },
                        ],
                    },
                },
            },
            {
                node: {
                    id: "5",
                    type: "product_carousel",
                    name: "Popular Products",
                    status: "1",
                    sortOrder: 5,
                    translations: {
                        edges: [
                            {
                                node: {
                                    id: "t5",
                                    themeCustomizationId: "5",
                                    locale: "en",
                                    options: JSON.stringify({
                                        title: "Popular Products",
                                        filters: { limit: "8" },
                                    }),
                                },
                            },
                        ],
                    },
                },
            },
            {
                node: {
                    id: "6",
                    type: "product_carousel",
                    name: "All Products",
                    status: "1",
                    sortOrder: 6,
                    translations: {
                        edges: [
                            {
                                node: {
                                    id: "t6",
                                    themeCustomizationId: "6",
                                    locale: "en",
                                    options: JSON.stringify({
                                        title: "All Products",
                                        filters: { limit: "8" },
                                    }),
                                },
                            },
                        ],
                    },
                },
            },
        ],
    },
};

export const MockProductsResponse = {
    products: {
        totalCount: 8,
        pageInfo: {
            startCursor: null,
            endCursor: null,
            hasNextPage: false,
            hasPreviousPage: false,
        },
        edges: [
            {
                node: {
                    id: "prod_1",
                    sku: "mock-product-1",
                    type: "simple",
                    name: "Rustic Wood Coffee Table",
                    price: 180.0,
                    urlKey: "rustic-wood-coffee-table",
                    baseImageUrl: "/images/76ziI3GsYbKMvbDe5lbMOKiDPpsBfj0Dsae2MJJ3.webp",
                    minimumPrice: 180.0,
                    specialPrice: null,
                    isSaleable: true,
                },
            },
            {
                node: {
                    id: "prod_2",
                    sku: "mock-product-2",
                    type: "simple",
                    name: "Modern Lounge Chair",
                    price: 250.0,
                    urlKey: "modern-lounge-chair",
                    baseImageUrl: "/images/915KzWNBIiVMZMyzMX5Dd71ZiPdnkdszRe5Ghknx.webp",
                    minimumPrice: 250.0,
                    specialPrice: 199.99,
                    isSaleable: true,
                },
            },
            {
                node: {
                    id: "prod_3",
                    sku: "mock-product-3",
                    type: "simple",
                    name: "Casual Green Sweater",
                    price: 45.0,
                    urlKey: "casual-green-sweater",
                    baseImageUrl: "/images/AA1X8qJMtgi3HKHGiwmV1LEPFrQk6Z8aYPc137Y0.webp",
                    minimumPrice: 45.0,
                    specialPrice: null,
                    isSaleable: true,
                },
            },
            {
                node: {
                    id: "prod_4",
                    sku: "mock-product-4",
                    type: "simple",
                    name: "Contemporary White Top",
                    price: 35.0,
                    urlKey: "contemporary-white-top",
                    baseImageUrl: "/images/FFHxE9HE2Ezt9aqvr6s3fPPCc1nrjwMNna1o1wTQ.webp",
                    minimumPrice: 35.0,
                    specialPrice: null,
                    isSaleable: true,
                },
            },
            {
                node: {
                    id: "prod_5",
                    sku: "mock-product-5",
                    type: "simple",
                    name: "Minimalist Yellow Shirt",
                    price: 25.0,
                    urlKey: "minimalist-yellow-shirt",
                    baseImageUrl: "/images/Fi03jjWdNqXYL9nhomSuSvBBFHFdUWWvu5i73mlX.webp",
                    minimumPrice: 25.0,
                    specialPrice: null,
                    isSaleable: true,
                },
            },
            {
                node: {
                    id: "prod_6",
                    sku: "mock-product-6",
                    type: "simple",
                    name: "Premium Coffee Maker",
                    price: 150.0,
                    urlKey: "premium-coffee-maker",
                    baseImageUrl: "/images/G4VN3pCRrL4cpzv1G56eEpAoYM2WvtjMRaTia8DO.webp",
                    minimumPrice: 150.0,
                    specialPrice: null,
                    isSaleable: true,
                },
            },
            {
                node: {
                    id: "prod_7",
                    sku: "mock-product-7",
                    type: "simple",
                    name: "Smart Watch Series 8",
                    price: 399.0,
                    urlKey: "smart-watch-series-8",
                    baseImageUrl: "/images/GMrmn8hk6KFToRnoBRSHysA40NyOEPne4iuJaaFP.webp",
                    minimumPrice: 399.0,
                    specialPrice: 349.0,
                    isSaleable: true,
                },
            },
            {
                node: {
                    id: "prod_8",
                    sku: "mock-product-8",
                    type: "simple",
                    name: "Wireless Headphones Pro",
                    price: 199.0,
                    urlKey: "wireless-headphones-pro",
                    baseImageUrl: "/images/GgVb64280ueUvsufBjCaQAfs7hlVyBcv3igpfjrO.webp",
                    minimumPrice: 199.0,
                    specialPrice: null,
                    isSaleable: true,
                },
            },
        ],
    },
};

export const MockHomeCategoriesResponse = {
    categories: {
        edges: [
            {
                node: {
                    id: "cat_1",
                    position: 1,
                    logoUrl: "/images/Gq6e6WLKes0EEZ3xZGAjX8CP3J10lSIvounyTuwE.webp",
                    translation: {
                        id: "t1",
                        name: "Electronics",
                        slug: "electronics",
                    },
                },
            },
            {
                node: {
                    id: "cat_2",
                    position: 2,
                    logoUrl: "/images/GuIZOJY3oW09ku4zqxIfKvtXho9gOnq4eCl0HmOW.webp",
                    translation: {
                        id: "t2",
                        name: "Furniture",
                        slug: "furniture",
                    },
                },
            },
            {
                node: {
                    id: "cat_3",
                    position: 3,
                    logoUrl: "/images/HRIEAfZ4vTc0hrW5G5L1tK3vzmwBXgZR781tjEwU.webp",
                    translation: {
                        id: "t3",
                        name: "Fashion",
                        slug: "fashion",
                    },
                },
            },
            {
                node: {
                    id: "cat_4",
                    position: 4,
                    logoUrl: "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?q=80&w=600&auto=format&fit=crop",
                    translation: {
                        id: "t4",
                        name: "Lifestyle",
                        slug: "lifestyle",
                    },
                },
            },
        ],
    },
};
