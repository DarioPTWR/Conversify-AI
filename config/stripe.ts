export const PLANS = [
    {
        name: "Free",
        slug: "free",
        quota:10,
        pagesPerPdf: 7,
        price: {
            amount: 0,
            priceIds: {
                test: '',
                production: '',
            }
        }
    },
    {
        name: "Pro",
        slug: "pro",
        quota:50,
        pagesPerPdf: 30,
        price: {
            amount: 14,
            priceIds: {
                test: 'price_1QA2FVH2a3bphSP7ttKFEjdL',
                production: '',
            }
        }
    },
]