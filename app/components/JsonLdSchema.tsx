/**
 * JSON-LD structured data for SEO
 * Helps search engines understand PartyTab as a SoftwareApplication
 */
export function JsonLdSchema() {
    const schema = {
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
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
