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

        <div className="rounded-2xl border border-sand-200 bg-sand-50 p-4 space-y-3">
          {/* Header matching real ClaimPanel */}
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold">Receipt Items</p>
              <p className="text-xs text-ink-500">
                Tap initials to claim. Shared items split evenly.
              </p>
            </div>
            <p className="text-xs text-ink-500 bg-sand-100 px-2 py-1 rounded-lg">
              +$3.12 tax
            </p>
          </div>

          {/* Mock items matching real ClaimPanel card style */}
          <div className="space-y-2">
            <div className="rounded-xl border border-sand-200 bg-white p-3">
              <p className="font-medium text-sm">Margherita Pizza</p>
              <p className="text-xs text-ink-500">$18.00</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <div className="w-8 h-8 rounded-full text-xs font-medium flex items-center justify-center bg-ink-900 text-white">AL</div>
                <div className="w-8 h-8 rounded-full text-xs font-medium flex items-center justify-center bg-ink-900 text-white">BE</div>
                <div className="w-8 h-8 rounded-full text-xs font-medium flex items-center justify-center bg-sand-100 text-ink-400">CK</div>
              </div>
            </div>
            <div className="rounded-xl border border-sand-200 bg-white p-3">
              <p className="font-medium text-sm">Caesar Salad</p>
              <p className="text-xs text-ink-500">$12.00</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <div className="w-8 h-8 rounded-full text-xs font-medium flex items-center justify-center bg-sand-100 text-ink-400">AL</div>
                <div className="w-8 h-8 rounded-full text-xs font-medium flex items-center justify-center bg-sand-100 text-ink-400">BE</div>
                <div className="w-8 h-8 rounded-full text-xs font-medium flex items-center justify-center bg-ink-900 text-white">CK</div>
              </div>
            </div>
            <div className="rounded-xl border border-sand-200 bg-white p-3">
              <p className="font-medium text-sm">Garlic Bread</p>
              <p className="text-xs text-ink-500">$6.00</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <div className="w-8 h-8 rounded-full text-xs font-medium flex items-center justify-center bg-ink-900 text-white">AL</div>
                <div className="w-8 h-8 rounded-full text-xs font-medium flex items-center justify-center bg-ink-900 text-white">BE</div>
                <div className="w-8 h-8 rounded-full text-xs font-medium flex items-center justify-center bg-ink-900 text-white">CK</div>
              </div>
            </div>
          </div>

          {/* Split summary matching real ClaimPanel */}
          <div className="rounded-xl bg-sand-100 p-3 space-y-1">
            <div className="flex justify-between items-center">
              <p className="text-xs font-medium text-ink-700">Split Summary</p>
              <p className="text-xs text-ink-500">incl. $3.12 tax</p>
            </div>
            <div className="flex justify-between text-xs text-ink-600">
              <span>Alex</span>
              <span>$13.06</span>
            </div>
            <div className="flex justify-between text-xs text-ink-600">
              <span>Beth</span>
              <span>$13.06</span>
            </div>
            <div className="flex justify-between text-xs text-ink-600">
              <span>Chris</span>
              <span>$13.00</span>
            </div>
          </div>
        </div>

        <div className="text-sm text-ink-600 space-y-2">
          <p><strong>How it works:</strong></p>
          <ol className="list-decimal list-inside space-y-1 text-ink-500">
            <li>Snap a photo of your receipt</li>
            <li>AI extracts each item and price</li>
            <li>Tap your initials on the items you ordered</li>
            <li>Tax, tip &amp; fees split proportionally</li>
          </ol>
        </div>

        <div className="pt-2 space-y-3">
          <a
            href="/upgrade"
            className="block w-full rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white text-center hover:bg-ink-800 transition"
          >
            Upgrade to Pro — $3.99/month
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
