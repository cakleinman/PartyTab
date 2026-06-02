/**
 * Outbound citation link to a primary source. Used for verified statistics in
 * blog posts. Every href passed here must point to a real, verified source that
 * actually states the cited figure — never a guessed or secondary URL.
 */
export function SourceLink({
    href,
    children,
}: {
    href: string;
    children: React.ReactNode;
}) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-600 hover:text-teal-700 underline"
        >
            {children}
        </a>
    );
}
