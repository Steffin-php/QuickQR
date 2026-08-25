import React from 'react';
import { Globe, Phone, Mail, Wifi, IndianRupee, Users } from 'lucide-react';
import { PresetType } from '../types';

interface PresetsBarProps {
  onSelectPreset: (preset: PresetType) => void;
  activePreset?: PresetType | null;
}

export const PresetsBar: React.FC<PresetsBarProps> = ({
  onSelectPreset,
  activePreset,
}) => {
  const presets: Array<{ id: PresetType; label: string; icon: React.ReactNode; tooltip: string }> = [
    {
      id: 'url',
      label: 'Website URL',
      icon: <Globe className="w-3.5 h-3.5" />,
      tooltip: 'Pre-fills "https://"',
    },
    {
      id: 'phone',
      label: 'Phone Number',
      icon: <Phone className="w-3.5 h-3.5" />,
      tooltip: 'Pre-fills "tel:"',
    },
    {
      id: 'email',
      label: 'Email',
      icon: <Mail className="w-3.5 h-3.5" />,
      tooltip: 'Pre-fills "mailto:"',
    },
    {
      id: 'wifi',
      label: 'WiFi Network',
      icon: <Wifi className="w-3.5 h-3.5" />,
      tooltip: 'Configure WiFi credentials',
    },
    {
      id: 'upi',
      label: 'UPI Payment',
      icon: <IndianRupee className="w-3.5 h-3.5" />,
      tooltip: 'Scan to pay via any UPI app',
    },
    {
      id: 'group',
      label: 'Join Group',
      icon: <Users className="w-3.5 h-3.5" />,
      tooltip: 'Scan to join WhatsApp or Telegram group',
    },
  ];

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex flex-wrap gap-2" role="group" aria-label="QR Code Presets">
        {presets.map((preset) => {
          const isActive = activePreset === preset.id;
          return (
            <button
              key={preset.id}
              id={`preset-${preset.id}-btn`}
              type="button"
              onClick={() => onSelectPreset(preset.id)}
              title={preset.tooltip}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                isActive
                  ? 'bg-cyan-500/15 border border-cyan-400/40 text-cyan-400 shadow-sm shadow-cyan-950/40'
                  : 'bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 text-slate-300'
              }`}
            >
              <span className={isActive ? 'text-cyan-400' : 'text-slate-400'}>
                {preset.icon}
              </span>
              <span>{preset.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
