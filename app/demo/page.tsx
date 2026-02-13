import DemoClient from "@/app/demo/DemoClient";

export const metadata = {
  title: "Demo | PartyTab",
  robots: { index: false, follow: false },
};

export default function DemoPage() {
  if (process.env.NODE_ENV === "production") {
    return (
      <div className="max-w-xl space-y-4">
        <h1 className="text-3xl font-semibold">Demo mode</h1>
        <p className="text-sm text-ink-500">
          Demo reset is only available in development.
        </p>
      </div>
    );
  }

  return <DemoClient />;
}
