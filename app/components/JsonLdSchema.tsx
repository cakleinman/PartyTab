/**
 * JSON-LD structured data for SEO
 * SoftwareApplication schema — used globally in layout.tsx
 */
export function JsonLdSchema() {
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
        },
        description:
            "Split group expenses for trips, dinners, and roommates. Track who paid what and settle up easily. No app download required.",
        url: "https://partytab.app",
        featureList: [
            "No app download required",
            "Instant tab creation",
            "Smart settlement calculations",
            "Share via link",
            "Receipt scanning (Pro)",
            "Payment reminders (Pro)",
        ],
        applicationSubCategory: "Expense Tracker",
        creator: {
            "@type": "Organization",
            name: "PartyTab",
            url: "https://partytab.app",
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }}
        />
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
}: {
    title: string;
    description: string;
    slug: string;
    datePublished: string;
}) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: title,
        description,
        url: `https://partytab.app/blog/${slug}`,
        datePublished,
        author: {
            "@type": "Organization",
            name: "PartyTab",
            url: "https://partytab.app",
        },
        publisher: {
            "@type": "Organization",
            name: "PartyTab",
            url: "https://partytab.app",
        },
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `https://partytab.app/blog/${slug}`,
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
