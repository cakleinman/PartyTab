import { FaqPageJsonLd } from "@/app/components/JsonLdSchema";

/**
 * Visible FAQ accordion + matching FAQPage JSON-LD in one place.
 * Pass plain-text question/answer strings (no HTML entities — React renders
 * the expression as text, so apostrophes/quotes are safe and won't double-encode).
 */
export function FaqSection({
    questions,
    heading = "Frequently Asked Questions",
}: {
    questions: { question: string; answer: string }[];
    heading?: string;
}) {
    return (
        <div className="mb-12">
            <FaqPageJsonLd questions={questions} />
            <h2 className="text-2xl font-bold text-ink-900 mb-6">{heading}</h2>
            <div className="space-y-3">
                {questions.map((q) => (
                    <details
                        key={q.question}
                        className="group rounded-2xl border border-sand-200 bg-white p-5 [&_summary]:cursor-pointer"
                    >
                        <summary className="flex items-center justify-between gap-3 font-semibold text-ink-900 list-none">
                            {q.question}
                            <span className="text-teal-600 transition-transform group-open:rotate-45 text-xl leading-none">
                                +
                            </span>
                        </summary>
                        <p className="mt-3 text-ink-600 leading-relaxed">{q.answer}</p>
                    </details>
                ))}
            </div>
        </div>
    );
}
