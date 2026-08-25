import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Download,
  Copy,
  Check,
  Sparkles,
  Palette,
  AlertCircle,
  QrCode,
  Maximize2
} from 'lucide-react';
import { QRColorConfig, QRResolution } from '../types';

interface QRCodeDisplayProps {
  text: string;
  colors: QRColorConfig;
  onColorChange: (colors: QRColorConfig) => void;
}

// Preset color themes with guaranteed good contrast
const COLOR_PRESETS: Array<{ name: string; fg: string; bg: string }> = [
  { name: 'Classic', fg: '#000000', bg: '#ffffff' },
  { name: 'Cyan Accent', fg: '#0891b2', bg: '#ffffff' },
  { name: 'Electric Teal', fg: '#06b6d4', bg: '#083344' },
  { name: 'Midnight', fg: '#09090b', bg: '#ecfeff' },
  { name: 'Navy', fg: '#0f172a', bg: '#f8fafc' },
  { name: 'Emerald', fg: '#064e3b', bg: '#f0fdf4' },
];

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  text,
  colors,
  onColorChange,
}) => {
  const qrContainerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [resolution, setResolution] = useState<QRResolution>(512);
  const [qrReady, setQrReady] = useState(false);
  const [libraryLoaded, setLibraryLoaded] = useState(false);

  // Check if qrcode.js is loaded
  useEffect(() => {
    const checkLibrary = () => {
      if (typeof window !== 'undefined' && (window as any).QRCode) {
        setLibraryLoaded(true);
        return true;
      }
      return false;
    };

    if (checkLibrary()) return;

    // Retry checking if script is still loading from CDN
    const interval = setInterval(() => {
      if (checkLibrary()) {
        clearInterval(interval);
      }
    }, 150);

    return () => clearInterval(interval);
  }, []);

  // Generate QR Code inside container
  useEffect(() => {
    const trimmed = text.trim();
    if (!trimmed || !libraryLoaded || !qrContainerRef.current) {
      setQrReady(false);
      return;
    }

    const container = qrContainerRef.current;
    container.innerHTML = ''; // Clear previous instances

    try {
      // Use the qrcode.js global constructor
      new (window as any).QRCode(container, {
        text: trimmed,
        width: 256,
        height: 256,
        colorDark: colors.foreground,
        colorLight: colors.background,
        correctLevel: (window as any).QRCode.CorrectLevel.H,
      });
      setQrReady(true);
    } catch (err) {
      console.error('Error generating QR code with qrcode.js:', err);
      setQrReady(false);
    }
  }, [text, colors, libraryLoaded]);

  // Helper to generate a crisp high-res canvas for download/copy
  const generateHighResCanvas = useCallback(
    async (size: number): Promise<HTMLCanvasElement | null> => {
      const trimmed = text.trim();
      if (!trimmed || !(window as any).QRCode) return null;

      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      document.body.appendChild(tempDiv);

      try {
        new (window as any).QRCode(tempDiv, {
          text: trimmed,
          width: size,
          height: size,
          colorDark: colors.foreground,
          colorLight: colors.background,
          correctLevel: (window as any).QRCode.CorrectLevel.H,
        });

        // Wait a tick for canvas rendering in DOM
        await new Promise((resolve) => setTimeout(resolve, 50));

        const canvas = tempDiv.querySelector('canvas');
        if (canvas) {
          // Add a protective quiet-zone margin around the canvas for optimal print scanning
          const margin = Math.round(size * 0.08); // 8% quiet zone
          const finalCanvas = document.createElement('canvas');
          finalCanvas.width = size + margin * 2;
          finalCanvas.height = size + margin * 2;
          const ctx = finalCanvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = colors.background;
            ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
            ctx.drawImage(canvas, margin, margin);
            return finalCanvas;
          }
          return canvas;
        }

        // If img was rendered instead of canvas
        const img = tempDiv.querySelector('img');
        if (img && img.src) {
          const imgObj = new Image();
          imgObj.crossOrigin = 'anonymous';
          imgObj.src = img.src;
          await new Promise((resolve) => {
            imgObj.onload = resolve;
          });
          const margin = Math.round(size * 0.08);
          const finalCanvas = document.createElement('canvas');
          finalCanvas.width = size + margin * 2;
          finalCanvas.height = size + margin * 2;
          const ctx = finalCanvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = colors.background;
            ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
            ctx.drawImage(imgObj, margin, margin, size, size);
            return finalCanvas;
          }
        }
        return null;
      } finally {
        if (document.body.contains(tempDiv)) {
          document.body.removeChild(tempDiv);
        }
      }
    },
    [text, colors]
  );

  // Download Handler
  const handleDownload = async () => {
    if (!text.trim()) return;
    setDownloading(true);

    try {
      const canvas = await generateHighResCanvas(resolution);
      if (!canvas) {
        // Fallback: grab from visible element
        const visibleCanvas = qrContainerRef.current?.querySelector('canvas');
        const visibleImg = qrContainerRef.current?.querySelector('img');
        const dataUrl = visibleCanvas?.toDataURL('image/png') || visibleImg?.src;
        if (dataUrl) {
          const link = document.createElement('a');
          link.download = `quickqr-${Date.now()}.png`;
          link.href = dataUrl;
          link.click();
        }
        setDownloading(false);
        return;
      }

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `quickqr-${resolution}px-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloading(false);
    }
  };

  // Copy to Clipboard Handler
  const handleCopyImage = async () => {
    if (!text.trim()) return;
    try {
      const canvas = await generateHighResCanvas(512);
      if (canvas && navigator.clipboard && (window as any).ClipboardItem) {
        canvas.toBlob(async (blob) => {
          if (blob) {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob }),
            ]);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }
        }, 'image/png');
      }
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  // Calculate simple contrast warning
  const isLowContrast = () => {
    // Quick hex brightness comparison
    const getBrightness = (hex: string) => {
      const c = hex.replace('#', '');
      if (c.length !== 6) return 128;
      const r = parseInt(c.substring(0, 2), 16);
      const g = parseInt(c.substring(2, 4), 16);
      const b = parseInt(c.substring(4, 6), 16);
      return (r * 299 + g * 587 + b * 114) / 1000;
    };
    const b1 = getBrightness(colors.foreground);
    const b2 = getBrightness(colors.background);
    return Math.abs(b1 - b2) < 80;
  };

  const hasText = text.trim().length > 0;

  return (
    <div className="flex flex-col items-center w-full">
      {/* QR Code Container Card */}
      <div className="w-full flex flex-col items-center">
        <div
          id="qr-preview-card"
          className="relative bg-white p-6 sm:p-8 rounded-[36px] sm:rounded-[40px] shadow-[0_0_80px_rgba(34,211,238,0.18)] mb-6 transition-all duration-300 flex flex-col items-center justify-center min-w-[280px] sm:min-w-[320px] aspect-square"
        >
          {hasText ? (
            <div className="flex flex-col items-center justify-center w-full h-full">
              <div
                id="qr-code-wrapper"
                style={{ backgroundColor: colors.background }}
                className="p-3 sm:p-4 rounded-2xl transition-all duration-200"
              >
                <div
                  ref={qrContainerRef}
                  id="qrcode-output"
                  className="flex items-center justify-center [&>img]:block [&>canvas]:block [&>img]:max-w-full [&>canvas]:max-w-full"
                />
              </div>
            </div>
          ) : (
            /* EMPTY STATE as requested */
            <div
              id="qr-empty-state"
              className="flex flex-col items-center justify-center text-center p-6 space-y-3"
            >
              <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                <QrCode className="w-8 h-8 stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-800">
                  QR Code Preview
                </p>
                <p className="text-xs text-slate-500 max-w-[200px] leading-relaxed">
                  Type something above to generate your QR code
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Low Contrast Warning */}
        {hasText && isLowContrast() && (
          <div className="mb-4 w-full max-w-sm p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Low contrast may make the QR code difficult for some phone cameras to scan.
            </span>
          </div>
        )}

        {/* Actions & Download */}
        {hasText && (
          <div className="w-full max-w-sm space-y-3">
            {/* Primary Download Button */}
            <button
              id="download-qr-btn"
              type="button"
              onClick={handleDownload}
              disabled={downloading || !qrReady}
              className="w-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold py-4 px-8 rounded-2xl shadow-lg shadow-cyan-950/40 transition-all flex items-center justify-center gap-3 active:scale-95 text-sm sm:text-base cursor-pointer disabled:opacity-50"
            >
              <Download className="w-5 h-5 stroke-[2.5]" />
              <span>{downloading ? 'Preparing Image...' : 'Download QR Code'}</span>
            </button>

            <div className="flex gap-2">
              {/* Secondary Copy Button */}
              <button
                id="copy-qr-btn"
                type="button"
                onClick={handleCopyImage}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-cyan-400" />
                    <span>Copy Image</span>
                  </>
                )}
              </button>

              {/* Resolution Selector Dropdown/Pills */}
              <div className="flex items-center gap-1 bg-slate-900/80 border border-slate-800 p-1 rounded-xl">
                {([256, 512, 1024] as QRResolution[]).map((res) => (
                  <button
                    key={res}
                    type="button"
                    onClick={() => setResolution(res)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono transition-colors cursor-pointer ${
                      resolution === res
                        ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {res === 1024 ? 'HD' : `${res}p`}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-center text-slate-500 text-xs font-medium pt-1">
              Generated instantly • No tracking • PNG format
            </p>
          </div>
        )}

        {/* Color Customization Section - Quick Palettes Only */}
        <div className="w-full max-w-sm mt-6 p-4 rounded-2xl bg-[#121214] border border-slate-800/80 text-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Palette className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Color Customization
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              Quick Palettes
            </span>
          </div>

          {/* Color Palette Presets */}
          <div className="flex items-center gap-2">
            {COLOR_PRESETS.map((p) => {
              const isSelected =
                colors.foreground.toLowerCase() === p.fg.toLowerCase() &&
                colors.background.toLowerCase() === p.bg.toLowerCase();
              return (
                <button
                  key={p.name}
                  type="button"
                  id={`palette-${p.name.toLowerCase().replace(/\s+/g, '-')}-btn`}
                  title={`${p.name}`}
                  onClick={() =>
                    onColorChange({ foreground: p.fg, background: p.bg })
                  }
                  className={`group relative flex-1 h-8 rounded-xl overflow-hidden border transition-all flex cursor-pointer ${
                    isSelected
                      ? 'ring-2 ring-cyan-400 border-cyan-300 scale-105 shadow-md shadow-cyan-950/50'
                      : 'border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <span
                    style={{ backgroundColor: p.fg }}
                    className="w-1/2 h-full block"
                  />
                  <span
                    style={{ backgroundColor: p.bg }}
                    className="w-1/2 h-full block"
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
