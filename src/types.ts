export type PresetType = 'url' | 'phone' | 'email' | 'wifi' | 'upi' | 'group' | 'text';

export interface WiFiConfig {
  ssid: string;
  password: string;
  encryption: 'WPA' | 'WEP' | 'nopass';
  hidden: boolean;
}

export interface QRColorConfig {
  foreground: string;
  background: string;
}

export type QRResolution = 256 | 512 | 1024;
