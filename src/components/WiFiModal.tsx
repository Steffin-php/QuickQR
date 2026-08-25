import React, { useState } from 'react';
import { Wifi, X, Eye, EyeOff, Lock, Check } from 'lucide-react';
import { WiFiConfig } from '../types';

interface WiFiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (wifiString: string) => void;
  currentValue?: string;
}

export const WiFiModal: React.FC<WiFiModalProps> = ({
  isOpen,
  onClose,
  onApply,
}) => {
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [encryption, setEncryption] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [hidden, setHidden] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  // Build the standardized WiFi QR Code string
  // Format: WIFI:T:WPA;S:networkname;P:password;H:true;;
  const generateWiFiString = (s: string, p: string, enc: string, isHidden: boolean) => {
    // Escape special characters: \ ; , : "
    const escape = (str: string) => str.replace(/([\\;,:"'])/g, '\\$1');
    const escapedSsid = escape(s);
    const escapedPass = escape(p);

    if (enc === 'nopass') {
      return `WIFI:T:nopass;S:${escapedSsid};${isHidden ? 'H:true;' : ''};`;
    }
    return `WIFI:T:${enc};S:${escapedSsid};P:${escapedPass};${isHidden ? 'H:true;' : ''};`;
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ssid.trim()) return;
    const formatted = generateWiFiString(ssid.trim(), password, encryption, hidden);
    onApply(formatted);
    onClose();
  };

  return (
    <div
      id="wifi-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="wifi-modal-content"
        className="w-full max-w-md bg-[#121214] border border-cyan-500/20 rounded-2xl p-6 shadow-2xl text-slate-100 relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white">WiFi Network QR</h3>
              <p className="text-xs text-slate-400">Allows smartphones to connect with a single scan</p>
            </div>
          </div>
          <button
            id="close-wifi-modal-btn"
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
              Network Name (SSID) *
            </label>
            <input
              id="wifi-ssid-input"
              type="text"
              required
              autoFocus
              value={ssid}
              onChange={(e) => setSsid(e.target.value)}
              placeholder="e.g. Home_WiFi_5G"
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700/70 focus:border-cyan-400 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 text-white font-mono text-sm placeholder:text-slate-600 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1.5">
              Security / Encryption
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['WPA', 'WEP', 'nopass'] as const).map((enc) => (
                <button
                  key={enc}
                  type="button"
                  id={`wifi-enc-${enc}-btn`}
                  onClick={() => setEncryption(enc)}
                  className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    encryption === enc
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-xs'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {enc === 'WPA' ? 'WPA/WPA2/WPA3' : enc === 'WEP' ? 'WEP' : 'No Password'}
                </button>
              ))}
            </div>
          </div>

          {encryption !== 'nopass' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="wifi-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter WiFi password"
                  className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-900 border border-slate-700/70 focus:border-cyan-400 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 text-white font-mono text-sm placeholder:text-slate-600 transition-all"
                />
                <button
                  type="button"
                  id="toggle-wifi-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="wifi-hidden-checkbox"
              checked={hidden}
              onChange={(e) => setHidden(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500/30 focus:ring-offset-0 cursor-pointer"
            />
            <label htmlFor="wifi-hidden-checkbox" className="text-xs text-slate-300 cursor-pointer select-none">
              Hidden Network (SSID is not broadcasted)
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              id="cancel-wifi-btn"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-sm font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="generate-wifi-qr-btn"
              disabled={!ssid.trim()}
              className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold text-sm shadow-lg shadow-cyan-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              Generate WiFi QR
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
