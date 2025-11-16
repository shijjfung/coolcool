const IPHONE_MODEL_MAP: Record<string, string> = {
  'iphone18,1': 'iPhone 17',
  'iphone18,2': 'iPhone 17 Plus',
  'iphone18,3': 'iPhone 17 Pro',
  'iphone18,4': 'iPhone 17 Pro Max',
  'iphone17,1': 'iPhone 16 Pro',
  'iphone17,2': 'iPhone 16 Pro Max',
  'iphone17,3': 'iPhone 16',
  'iphone17,4': 'iPhone 16 Plus',
  'iphone16,1': 'iPhone 15 Pro',
  'iphone16,2': 'iPhone 15 Pro Max',
  'iphone15,4': 'iPhone 15',
  'iphone15,5': 'iPhone 15 Plus',
  'iphone15,2': 'iPhone 14 Pro',
  'iphone15,3': 'iPhone 14 Pro Max',
  'iphone14,7': 'iPhone 14',
  'iphone14,8': 'iPhone 14 Plus',
  'iphone14,2': 'iPhone 13 Pro',
  'iphone14,3': 'iPhone 13 Pro Max',
  'iphone13,2': 'iPhone 12 Pro',
  'iphone13,3': 'iPhone 12 Pro Max',
  'iphone12,8': 'iPhone SE (第2代)',
  'iphone11,8': 'iPhone XR',
  'iphone11,2': 'iPhone XS',
  'iphone11,6': 'iPhone XS Max',
  'iphone10,3': 'iPhone X',
  'iphone10,6': 'iPhone X',
  'iphone9,1': 'iPhone 7',
  'iphone9,2': 'iPhone 7 Plus',
  'iphone9,3': 'iPhone 7',
  'iphone9,4': 'iPhone 7 Plus',
  'iphone8,1': 'iPhone 6s',
  'iphone8,2': 'iPhone 6s Plus',
  'iphone8,4': 'iPhone SE',
  'iphone7,1': 'iPhone 6 Plus',
  'iphone7,2': 'iPhone 6',
};

const SAMSUNG_SERIES_LABELS: Array<{ prefix: string; label: string }> = [
  { prefix: 'SM-S', label: 'Samsung Galaxy S' },
  { prefix: 'SM-N', label: 'Samsung Galaxy Note' },
  { prefix: 'SM-A', label: 'Samsung Galaxy A' },
  { prefix: 'SM-G', label: 'Samsung Galaxy' },
  { prefix: 'SM-F', label: 'Samsung Galaxy Fold' },
];

const MAC_VERSION_NAMES: Record<number, string> = {
  14: 'macOS Sonoma',
  13: 'macOS Ventura',
  12: 'macOS Monterey',
  11: 'macOS Big Sur',
};

const WINDOWS_VERSION_MAP: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /windows nt 10\.0/i, label: 'Windows 10/11' },
  { pattern: /windows nt 6\.3/i, label: 'Windows 8.1' },
  { pattern: /windows nt 6\.2/i, label: 'Windows 8' },
  { pattern: /windows nt 6\.1/i, label: 'Windows 7' },
];

const describeIphoneModel = (userAgent: string): string | null => {
  const normalized = userAgent.toLowerCase();
  const codeMatch = normalized.match(/iphone\d+,\d+/);
  if (!codeMatch) return null;
  const code = codeMatch[0];
  if (IPHONE_MODEL_MAP[code]) {
    return IPHONE_MODEL_MAP[code];
  }
  const seriesMatch = code.match(/iphone(\d+),/);
  if (seriesMatch) {
    const series = parseInt(seriesMatch[1], 10);
    if (!Number.isNaN(series)) {
      return `iPhone ${series}`;
    }
  }
  return `iPhone (${code.replace('iphone', 'iPhone ').toUpperCase()})`;
};

const describeAndroidModel = (userAgent: string): string | null => {
  const normalized = userAgent.toLowerCase();
  const samsungMatch = normalized.match(/sm-[a-z0-9]+/);
  if (samsungMatch) {
    const code = samsungMatch[0].toUpperCase();
    if (code.startsWith('SM-S93')) return 'Samsung Galaxy S25';
    if (code.startsWith('SM-S92')) return 'Samsung Galaxy S24';
    if (code.startsWith('SM-S91')) return 'Samsung Galaxy S23';
    for (const series of SAMSUNG_SERIES_LABELS) {
      if (code.startsWith(series.prefix)) {
        const modelSuffix = code.slice(series.prefix.length);
        return modelSuffix ? `${series.label} ${modelSuffix}` : series.label;
      }
    }
    return `Samsung (${code})`;
  }

  const pixelMatch = userAgent.match(/Pixel\s?[0-9a-zA-Z ]+/);
  if (pixelMatch) {
    return pixelMatch[0].trim();
  }

  const genericMatch = userAgent.match(/;\s*([^;()]+?)\s*(?:Build|\))/);
  if (genericMatch) {
    const candidate = genericMatch[1].trim();
    if (candidate && !candidate.toLowerCase().includes('android')) {
      return candidate;
    }
  }

  return null;
};

export const describeDeviceFromUserAgent = (raw?: string | null): string => {
  const userAgent = raw || '';
  if (!userAgent) return '未知裝置';

  if (/ipad/i.test(userAgent)) {
    const iosMatch = userAgent.match(/cpu os (\d+)_(\d+)/i);
    if (iosMatch) {
      return `iPad (iPadOS ${iosMatch[1]}.${iosMatch[2]})`;
    }
    return 'iPad';
  }

  if (/iphone/i.test(userAgent)) {
    const model = describeIphoneModel(userAgent);
    if (model) return model;
    const iosMatch = userAgent.match(/os (\d+)_(\d+)/i);
    if (iosMatch) {
      return `iPhone (iOS ${iosMatch[1]}.${iosMatch[2]})`;
    }
    return 'iPhone';
  }

  if (/android/i.test(userAgent) && !/tablet/i.test(userAgent)) {
    const model = describeAndroidModel(userAgent);
    if (model) return model;
    return 'Android 手機';
  }

  if (/android/i.test(userAgent)) {
    return 'Android 平板';
  }

  if (/macintosh|mac os x/i.test(userAgent)) {
    const macMatch = userAgent.match(/mac os x (\d+)[._](\d+)/i);
    if (macMatch) {
      const major = parseInt(macMatch[1], 10);
      const minor = parseInt(macMatch[2], 10);
      if (major === 10) {
        if (minor >= 15) return 'macOS Catalina';
        if (minor >= 14) return 'macOS Mojave';
        if (minor >= 13) return 'macOS High Sierra';
        return 'macOS';
      }
      if (MAC_VERSION_NAMES[major]) {
        return MAC_VERSION_NAMES[major];
      }
      if (major >= 15) {
        return `macOS (版本 ${major}.${minor})`;
      }
    }
    return 'Mac 電腦';
  }

  if (/windows/i.test(userAgent)) {
    for (const version of WINDOWS_VERSION_MAP) {
      if (version.pattern.test(userAgent)) {
        return version.label;
      }
    }
    return 'Windows';
  }

  if (/linux/i.test(userAgent)) {
    return 'Linux';
  }

  return '其他裝置';
};

