import React, { useState } from 'react';
import { Users, X, Check } from 'lucide-react';

interface GroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (groupUrl: string) => void;
}

export const GroupModal: React.FC<GroupModalProps> = ({
  isOpen,
  onClose,
  onApply,
}) => {
  const [platform, setPlatform] = useState<'whatsapp' | 'telegram'>('whatsapp');
  const [inviteUrl, setInviteUrl] = useState('');

  if (!isOpen) return null;

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteUrl.trim()) return;

    onApply(inviteUrl.trim());
    onClose();
  };

  return (
    <div
      id="group-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="group-modal-content"
        className="w-full max-w-md bg-[#121214] border border-cyan-500/20 rounded-2xl p-6 shadow-2xl text-slate-100 relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Join Group QR</h3>
              <p className="text-xs text-slate-400">Scan to join the group instantly</p>
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
              Choose Platform
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                id="platform-whatsapp-btn"
                onClick={() => {
                  setPlatform('whatsapp');
                  if (!inviteUrl || inviteUrl.includes('t.me')) {
                    setInviteUrl('');
                  }
                }}
                className={`py-2.5 px-3 text-xs font-semibold rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  platform === 'whatsapp'
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-xs'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <span>WhatsApp</span>
              </button>
              <button
                type="button"
                id="platform-telegram-btn"
                onClick={() => {
                  setPlatform('telegram');
                  if (!inviteUrl || inviteUrl.includes('chat.whatsapp.com')) {
                    setInviteUrl('');
                  }
                }}
                className={`py-2.5 px-3 text-xs font-semibold rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  platform === 'telegram'
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-xs'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <span>Telegram</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1.5">
              {platform === 'whatsapp' ? 'WhatsApp Group Invite Link *' : 'Telegram Group/Channel Link *'}
            </label>
            <input
              type="url"
              id="group-invite-input"
              required
              value={inviteUrl}
              onChange={(e) => setInviteUrl(e.target.value)}
              placeholder={
                platform === 'whatsapp'
                  ? 'https://chat.whatsapp.com/AbCdEf12345...'
                  : 'https://t.me/yourgroup or https://t.me/+joinlink...'
              }
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700/70 focus:border-cyan-400 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 text-white font-mono text-sm placeholder:text-slate-600 transition-all"
            />
            <span className="block text-[11px] text-slate-500 mt-1">
              {platform === 'whatsapp'
                ? 'Paste the invite link from WhatsApp Group Info > Invite via link'
                : 'Paste the Telegram group link or private invite link'}
            </span>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              id="cancel-group-btn"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-sm font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="generate-group-qr-btn"
              disabled={!inviteUrl.trim()}
              className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold text-sm shadow-lg shadow-cyan-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              Generate Group QR
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
