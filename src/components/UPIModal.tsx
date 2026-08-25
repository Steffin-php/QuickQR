import React, { useState } from 'react';
import { IndianRupee, X, Check } from 'lucide-react';

interface UPIModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (upiString: string) => void;
}

export const UPIModal: React.FC<UPIModalProps> = ({
  isOpen,
  onClose,
  onApply,
}) => {
  const [upiId, setUpiId] = useState('');
  const [amount, setAmount] = useState('');

  if (!isOpen) return null;

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!upiId.trim()) return;

    const cleanUpi = upiId.trim();
    const cleanAmount = amount.trim();

    // Format: upi://pay?pa=UPIID&am=AMOUNT&cu=INR
    // If amount is empty, omit &am= and &cu=INR or standard upi://pay?pa=UPIID
    let upiUrl = `upi://pay?pa=${encodeURIComponent(cleanUpi)}`;
    if (cleanAmount && !isNaN(Number(cleanAmount)) && Number(cleanAmount) > 0) {
      upiUrl += `&am=${encodeURIComponent(cleanAmount)}&cu=INR`;
    }

    onApply(upiUrl);
    onClose();
  };

  return (
    <div
      id="upi-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="upi-modal-content"
        className="w-full max-w-md bg-[#121214] border border-cyan-500/20 rounded-2xl p-6 shadow-2xl text-slate-100 relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">UPI Payment QR</h3>
              <p className="text-xs text-slate-400">Scan to pay via any UPI app</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1.5">
              UPI ID (VPA) *
            </label>
            <input
              type="text"
              id="upi-id-input"
              required
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="e.g. merchant@okaxis or name@upi"
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700/70 focus:border-cyan-400 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 text-white font-mono text-sm placeholder:text-slate-600 transition-all"
            />
            <span className="block text-[11px] text-slate-500 mt-1">
              Supports Google Pay, PhonePe, Paytm, BHIM & all bank UPI apps
            </span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1.5">
              Amount (₹ INR) <span className="text-slate-500 font-normal lowercase">(optional)</span>
            </label>
            <input
              type="number"
              id="upi-amount-input"
              step="any"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 500 (leave blank for custom amount)"
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700/70 focus:border-cyan-400 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 text-white font-mono text-sm placeholder:text-slate-600 transition-all"
            />
            <span className="block text-[11px] text-slate-500 mt-1">
              Leave blank to let payer enter any amount themselves
            </span>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              id="cancel-upi-btn"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-sm font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="generate-upi-qr-btn"
              disabled={!upiId.trim()}
              className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold text-sm shadow-lg shadow-cyan-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              Generate UPI QR
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
