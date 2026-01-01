"use client";

interface ProPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProPreviewModal({ isOpen, onClose }: ProPreviewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400">
              <svg className="h-3.5 w-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2Z" />
              </svg>
            </span>
            <h2 className="text-xl font-semibold">Pro Feature</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-sand-100"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="rounded-2xl border border-sand-200 bg-sand-50 p-4">
          <h3 className="font-medium text-ink-700 mb-3">Receipt Scanning & Claim Mode</h3>

          {/* Mock receipt preview */}
          <div className="rounded-xl border border-sand-200 bg-white p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm text-ink-500 border-b border-sand-100 pb-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              AI-parsed receipt items
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between py-2 border-b border-sand-50">
                <div className="flex items-center gap-3">
                  <span className="text-sm">Margherita Pizza</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">$18.00</span>
                  <div className="flex -space-x-1">
                    <div className="h-6 w-6 rounded-full bg-blue-200 border-2 border-white flex items-center justify-center text-xs font-medium">A</div>
                    <div className="h-6 w-6 rounded-full bg-green-200 border-2 border-white flex items-center justify-center text-xs font-medium">B</div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-sand-50">
                <div className="flex items-center gap-3">
                  <span className="text-sm">Caesar Salad</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">$12.00</span>
                  <div className="flex -space-x-1">
                    <div className="h-6 w-6 rounded-full bg-purple-200 border-2 border-white flex items-center justify-center text-xs font-medium">C</div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-sand-50">
                <div className="flex items-center gap-3">
                  <span className="text-sm">Garlic Bread</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">$6.00</span>
                  <div className="flex -space-x-1">
                    <div className="h-6 w-6 rounded-full bg-blue-200 border-2 border-white flex items-center justify-center text-xs font-medium">A</div>
                    <div className="h-6 w-6 rounded-full bg-green-200 border-2 border-white flex items-center justify-center text-xs font-medium">B</div>
                    <div className="h-6 w-6 rounded-full bg-purple-200 border-2 border-white flex items-center justify-center text-xs font-medium">C</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 text-xs text-ink-400">
              Guests claim what they ate. Splits calculated automatically.
            </div>
          </div>
        </div>

        <div className="text-sm text-ink-600 space-y-2">
          <p><strong>How it works:</strong></p>
          <ol className="list-decimal list-inside space-y-1 text-ink-500">
            <li>Snap a photo of your receipt</li>
            <li>AI extracts each item and price</li>
            <li>Guests claim the items they ordered</li>
            <li>Splits are calculated automatically</li>
          </ol>
        </div>

        <div className="pt-2 space-y-3">
          <a
            href="/upgrade"
            className="block w-full rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white text-center hover:bg-ink-800 transition"
          >
            Upgrade to Pro — $3/month
          </a>
          <button
            onClick={onClose}
            className="w-full text-center text-sm text-ink-500 hover:text-ink-700"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
