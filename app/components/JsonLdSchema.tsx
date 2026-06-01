const SITE_URL = "https://partytab.app";
const LOGO_URL = `${SITE_URL}/icon-512.png`;
const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

// Social profiles for Organization.sameAs — add URLs here as accounts are created.
const SOCIAL_PROFILES: string[] = [];

/**
 * JSON-LD structured data for SEO — rendered once globally in layout.tsx.
 * Emits the brand Organization, the WebSite entity (with a referenceable @id),
 * and the SoftwareApplication describing the product.
 */
export function JsonLdSchema() {
    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": ORG_ID,
        name: "PartyTab",
        url: SITE_URL,
        logo: {
            "@type": "ImageObject",
            url: LOGO_URL,
            width: 512,
            height: 512,
        },
        description:
            "PartyTab is a free, browser-based bill splitting app. Groups create a tab, log expenses as they go, and settle up with minimal payments — no app download required.",
        ...(SOCIAL_PROFILES.length > 0 ? { sameAs: SOCIAL_PROFILES } : {}),
    };

    const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        name: "PartyTab",
        url: SITE_URL,
        publisher: { "@id": ORG_ID },
    };

    const appSchema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "PartyTab",
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web Browser",
        offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
        },
        description:
            "Split group expenses for trips, dinners, and roommates. Track who paid what and settle up easily. No app download required.",
        url: SITE_URL,
        featureList: [
            "No app download required",
            "Instant tab creation",
            "Smart settlement calculations",
            "Share via link",
            "Receipt scanning (Pro)",
            "Payment reminders (Pro)",
        ],
        applicationSubCategory: "Expense Tracker",
        creator: { "@id": ORG_ID },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }}
            />
        </>
    );
}

/**
 * FAQPage JSON-LD — only used on the landing page where the FAQ is visible
 */
export function FaqJsonLd() {
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
            {
                "@type": "Question",
                name: "Is PartyTab free?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes! PartyTab is completely free to use with no ads. Create tabs, add expenses, and settle up at no cost. PartyTab Pro adds premium features like AI receipt scanning and payment reminders.",
                },
            },
            {
                "@type": "Question",
                name: "Do my friends need to download an app?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "No. PartyTab works entirely in the browser. Just share a link and anyone can view the tab and add expenses\u2014no download, no sign-up required.",
                },
            },
            {
                "@type": "Question",
                name: "How does PartyTab calculate who owes what?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "PartyTab uses a smart settlement algorithm that minimizes the number of payments needed. Instead of everyone paying everyone else, we figure out the fewest possible transfers to settle all debts.",
                },
            },
            {
                "@type": "Question",
                name: "Can I use PartyTab for roommate expenses?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "Absolutely. PartyTab works great for recurring roommate expenses like rent, utilities, and groceries. Create a tab for your household and log expenses as they come up.",
                },
            },
            {
                "@type": "Question",
                name: "What makes PartyTab different from Splitwise?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "PartyTab works in your browser with no app download needed. It's free with no ads, and anyone can join a tab via a shared link without creating an account. See the full comparison at partytab.app/compare/splitwise.",
                },
            },
        ],
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
    );
}

/**
 * Article/BlogPosting JSON-LD — used on individual blog post pages
 */
export function BlogPostJsonLd({
    title,
    description,
    slug,
    datePublished,
    dateModified,
    image,
}: {
    title: string;
    description: string;
    slug: string;
    datePublished: string;
    dateModified?: string;
    image?: string;
}) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: title,
        description,
        image: image ?? `${SITE_URL}/opengraph-image`,
        url: `${SITE_URL}/blog/${slug}`,
        datePublished,
        dateModified: dateModified ?? datePublished,
        author: {
            "@type": "Organization",
            name: "PartyTab",
            url: SITE_URL,
        },
        publisher: {
            "@type": "Organization",
            name: "PartyTab",
            url: SITE_URL,
            logo: {
                "@type": "ImageObject",
                url: LOGO_URL,
                width: 512,
                height: 512,
            },
        },
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `${SITE_URL}/blog/${slug}`,
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

/**
 * Product JSON-LD for the paid PartyTab Pro plan — used on /upgrade.
 * Exposes the monthly + annual offers that the free SoftwareApplication offer omits.
 */
export function ProPlanJsonLd() {
    const schema = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: "PartyTab Pro",
        description:
            "PartyTab Pro adds AI receipt scanning, item-level claiming, and automated payment reminders to the free PartyTab bill-splitting app.",
        brand: { "@type": "Brand", name: "PartyTab" },
        url: `${SITE_URL}/upgrade`,
        offers: [
            {
                "@type": "Offer",
                name: "Monthly",
                price: "3.99",
                priceCurrency: "USD",
                availability: "https://schema.org/InStock",
                url: `${SITE_URL}/upgrade`,
            },
            {
                "@type": "Offer",
                name: "Annual",
                price: "34.99",
                priceCurrency: "USD",
                availability: "https://schema.org/InStock",
                url: `${SITE_URL}/upgrade`,
            },
        ],
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

/**
 * HowTo JSON-LD — used on the how-it-works page
 */
export function HowToJsonLd({
    name,
    description,
    steps,
}: {
    name: string;
    description: string;
    steps: { name: string; text: string }[];
}) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name,
        description,
        step: steps.map((step, index) => ({
            "@type": "HowToStep",
            position: index + 1,
            name: step.name,
            text: step.text,
        })),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

/**
 * Reusable FAQPage JSON-LD — accepts custom Q&A pairs
 */
export function FaqPageJsonLd({
    questions,
}: {
    questions: { question: string; answer: string }[];
}) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: questions.map((q) => ({
            "@type": "Question",
            name: q.question,
            acceptedAnswer: {
                "@type": "Answer",
                text: q.answer,
            },
        })),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

/**
 * ItemList JSON-LD — for index/collection pages (blog index, use-cases index).
 */
export function ItemListJsonLd({
    items,
}: {
    items: { name: string; url: string }[];
}) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            url: item.url,
        })),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

/**
 * BreadcrumbList JSON-LD — used on blog posts and use-case pages
 */
export function BreadcrumbJsonLd({
    items,
}: {
    items: { name: string; url: string }[];
}) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
