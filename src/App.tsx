/**
 * QuickQR — A Simple, Modern QR Code Generator
 * 
 * Features:
 * - Live real-time QR generation via qrcode.js
 * - Dark theme with purple accents
 * - Monospace input field with quick presets (URL, Phone, Email, WiFi)
 * - Interactive WiFi network modal helper
 * - Custom QR foreground & background color pickers
 * - High-res PNG image download & copy to clipboard
 * - Responsive, mobile-friendly design with generous whitespace
 */

import React, { useState, useRef } from 'react';
import {
  QrCode,
  Sparkles,
  RotateCcw,
  ClipboardPaste,
  Check,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { PresetsBar } from './components/PresetsBar';
import { QRCodeDisplay } from './components/QRCodeDisplay';
import { WiFiModal } from './components/WiFiModal';
import { UPIModal } from './components/UPIModal';
import { GroupModal } from './components/GroupModal';
import { PresetType, QRColorConfig } from './types';

export default function App() {
  // Input text state
  const [inputText, setInputText] = useState('https://github.com');
  // Color configuration (default: black foreground, white background for maximum scan contrast)
  const [colors, setColors] = useState<QRColorConfig>({
    foreground: '#000000',
    background: '#ffffff',
  });
  // Active preset tracker
  const [activePreset, setActivePreset] = useState<PresetType | null>('url');
  // Modals state
  const [isWiFiModalOpen, setIsWiFiModalOpen] = useState(false);
  const [isUPIModalOpen, setIsUPIModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  // Paste feedback state
  const [pasted, setPasted] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Handle Preset Button Clicks
  const handlePresetSelect = (preset: PresetType) => {
    setActivePreset(preset);

    if (preset === 'wifi') {
      setIsWiFiModalOpen(true);
      return;
    }

    if (preset === 'upi') {
      setIsUPIModalOpen(true);
      return;
    }

    if (preset === 'group') {
      setIsGroupModalOpen(true);
      return;
    }

    if (preset === 'url') {
      setInputText('https://');
    } else if (preset === 'phone') {
      setInputText('tel:+1');
    } else if (preset === 'email') {
      setInputText('mailto:hello@example.com');
    }

    // Auto focus the input field for immediate typing
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(
          inputRef.current.value.length,
          inputRef.current.value.length
        );
      }
    }, 50);
  };

  // Handle WiFi modal completion
  const handleWiFiApply = (wifiString: string) => {
    setInputText(wifiString);
    setActivePreset('wifi');
  };

  // Handle UPI modal completion
  const handleUPIApply = (upiString: string) => {
    setInputText(upiString);
    setActivePreset('upi');
  };

  // Handle Group modal completion
  const handleGroupApply = (groupUrl: string) => {
    setInputText(groupUrl);
    setActivePreset('group');
  };

  // Paste from clipboard helper
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputText(text);
        setPasted(true);
        setTimeout(() => setPasted(false), 1500);
      }
    } catch (err) {
      console.warn('Clipboard paste permission denied or not supported');
    }
  };

  // Clear text
  const handleClear = () => {
    setInputText('');
    setActivePreset(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-slate-200 flex flex-col justify-between selection:bg-cyan-500 selection:text-black font-sans">
      {/* Subtle ambient cyan glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-cyan-500/10 blur-[140px] rounded-full" />
      </div>

      {/* Top Navigation Bar */}
      <nav className="w-full flex items-center justify-between px-6 sm:px-12 py-6 sm:py-8 border-b border-slate-900/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-cyan-400 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/25">
            <QrCode className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">QuickQR</span>
        </div>
        <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm font-medium text-slate-500">
          <span className="hidden sm:inline hover:text-slate-300 transition-colors">Instant Generator</span>
          <span className="hidden sm:inline hover:text-slate-300 transition-colors">Zero Tracking</span>
          <span className="text-cyan-400 font-semibold bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded-full text-xs">
            Free & Fast
          </span>
        </div>
      </nav>

      {/* Main Content Flow */}
      <main className="flex-1 flex flex-col items-center px-4 sm:px-12 py-8 sm:py-10 max-w-4xl mx-auto w-full">
        {/* Input & Presets Container */}
        <div className="w-full max-w-2xl mb-8 space-y-4">
          {/* Quick Presets */}
          <div className="flex items-center justify-between">
            <PresetsBar
              onSelectPreset={handlePresetSelect}
              activePreset={activePreset}
            />
          </div>

          {/* Main Input Box */}
          <div className="relative group">
            <div className="bg-[#121214] border-2 border-cyan-500/25 focus-within:border-cyan-400 rounded-2xl p-4 sm:p-5 transition-all shadow-inner">
              <div className="flex items-center justify-between pb-2 mb-1 border-b border-slate-800/60">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {inputText.startsWith('upi://')
                    ? '💸 UPI Payment'
                    : inputText.startsWith('https://chat.whatsapp.com') || inputText.startsWith('https://t.me')
                    ? '👥 Group Invite'
                    : inputText.startsWith('http')
                    ? '🌐 Web Link'
                    : inputText.startsWith('tel:')
                    ? '📞 Phone Contact'
                    : inputText.startsWith('mailto:')
                    ? '✉️ Email Address'
                    : inputText.startsWith('WIFI:')
                    ? '📶 WiFi Network'
                    : '📝 Text / Content'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    id="paste-input-btn"
                    onClick={handlePaste}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-cyan-300 transition-colors py-0.5 px-2 rounded-md hover:bg-slate-800 cursor-pointer"
                    title="Paste from clipboard"
                  >
                    {pasted ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Pasted</span>
                      </>
                    ) : (
                      <>
                        <ClipboardPaste className="w-3 h-3" />
                        <span>Paste</span>
                      </>
                    )}
                  </button>

                  {inputText && (
                    <button
                      type="button"
                      id="clear-input-btn"
                      onClick={handleClear}
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-400 transition-colors py-0.5 px-2 rounded-md hover:bg-slate-800 cursor-pointer"
                      title="Clear text"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Clear</span>
                    </button>
                  )}
                </div>
              </div>

              <textarea
                ref={inputRef}
                id="qr-text-input"
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  setActivePreset(null);
                }}
                rows={3}
                placeholder="Enter a URL, text, phone number, or WiFi details..."
                className="w-full bg-transparent outline-none font-mono text-base sm:text-lg text-cyan-50 placeholder:text-slate-700 resize-none transition-all leading-relaxed"
              />

              <div className="flex justify-end pt-1 text-[11px] text-slate-600">
                <span>{inputText.length} characters</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live QR Code Display, Customization & Download */}
        <div className="w-full max-w-2xl flex flex-col items-center">
          <QRCodeDisplay
            text={inputText}
            colors={colors}
            onColorChange={setColors}
          />
        </div>
      </main>

      {/* WiFi Setup Modal */}
      <WiFiModal
        isOpen={isWiFiModalOpen}
        onClose={() => setIsWiFiModalOpen(false)}
        onApply={handleWiFiApply}
      />

      {/* UPI Payment Modal */}
      <UPIModal
        isOpen={isUPIModalOpen}
        onClose={() => setIsUPIModalOpen(false)}
        onApply={handleUPIApply}
      />

      {/* Join Group Modal */}
      <GroupModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        onApply={handleGroupApply}
      />

      {/* Sophisticated Footer */}
      <footer className="w-full px-6 sm:px-12 py-8 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-600 font-medium gap-4">
        <div>&copy; QuickQR Lab. All rights reserved.</div>
        <div className="flex gap-8 uppercase tracking-widest text-[10px]">
          <span>Generated Instantly</span>
          <span>No Tracking</span>
          <span>PNG Format</span>
        </div>
      </footer>
    </div>
  );
}
