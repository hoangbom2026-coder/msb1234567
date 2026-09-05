/**
 * localeController.js
 *
 * Detect ngôn ngữ + timezone của user dựa trên IP.
 * Dùng bảng ánh xạ country→locale tĩnh (không cần external API, không rate-limit).
 * IP geolocation dùng header X-Forwarded-For (Nginx forward) hoặc socket.remoteAddress.
 *
 * GET /api/config/locale
 * Response: { locale: 'vi'|'en'|..., timezone: 'Asia/Ho_Chi_Minh'|..., country: 'VN'|... }
 */

// Country code → { locale, timezone }
// Tập trung vào các thị trường chính, fallback về en/UTC
const COUNTRY_LOCALE_MAP = {
  // Đông Nam Á
  VN: { locale: 'vi', timezone: 'Asia/Ho_Chi_Minh', currency: 'VND', dateFormat: 'DD/MM/YYYY' },
  TH: { locale: 'th', timezone: 'Asia/Bangkok',     currency: 'THB', dateFormat: 'DD/MM/YYYY' },
  MY: { locale: 'ms', timezone: 'Asia/Kuala_Lumpur',currency: 'MYR', dateFormat: 'DD/MM/YYYY' },
  SG: { locale: 'en', timezone: 'Asia/Singapore',   currency: 'SGD', dateFormat: 'DD/MM/YYYY' },
  PH: { locale: 'en', timezone: 'Asia/Manila',      currency: 'PHP', dateFormat: 'MM/DD/YYYY' },
  ID: { locale: 'id', timezone: 'Asia/Jakarta',     currency: 'IDR', dateFormat: 'DD/MM/YYYY' },
  KH: { locale: 'km', timezone: 'Asia/Phnom_Penh',  currency: 'KHR', dateFormat: 'DD/MM/YYYY' },
  MM: { locale: 'my', timezone: 'Asia/Rangoon',     currency: 'MMK', dateFormat: 'DD/MM/YYYY' },
  LA: { locale: 'lo', timezone: 'Asia/Vientiane',   currency: 'LAK', dateFormat: 'DD/MM/YYYY' },
  // Đông Á
  CN: { locale: 'zh', timezone: 'Asia/Shanghai',    currency: 'CNY', dateFormat: 'YYYY/MM/DD' },
  TW: { locale: 'zh', timezone: 'Asia/Taipei',      currency: 'TWD', dateFormat: 'YYYY/MM/DD' },
  HK: { locale: 'zh', timezone: 'Asia/Hong_Kong',   currency: 'HKD', dateFormat: 'DD/MM/YYYY' },
  JP: { locale: 'ja', timezone: 'Asia/Tokyo',       currency: 'JPY', dateFormat: 'YYYY/MM/DD' },
  KR: { locale: 'ko', timezone: 'Asia/Seoul',       currency: 'KRW', dateFormat: 'YYYY/MM/DD' },
  // Châu Âu
  GB: { locale: 'en', timezone: 'Europe/London',    currency: 'GBP', dateFormat: 'DD/MM/YYYY' },
  DE: { locale: 'de', timezone: 'Europe/Berlin',    currency: 'EUR', dateFormat: 'DD.MM.YYYY'  },
  FR: { locale: 'fr', timezone: 'Europe/Paris',     currency: 'EUR', dateFormat: 'DD/MM/YYYY' },
  RU: { locale: 'ru', timezone: 'Europe/Moscow',    currency: 'RUB', dateFormat: 'DD.MM.YYYY'  },
  // Mỹ / Úc
  US: { locale: 'en', timezone: 'America/New_York', currency: 'USD', dateFormat: 'MM/DD/YYYY' },
  CA: { locale: 'en', timezone: 'America/Toronto',  currency: 'CAD', dateFormat: 'MM/DD/YYYY' },
  AU: { locale: 'en', timezone: 'Australia/Sydney', currency: 'AUD', dateFormat: 'DD/MM/YYYY' },
  // Trung Đông
  AE: { locale: 'ar', timezone: 'Asia/Dubai',       currency: 'AED', dateFormat: 'DD/MM/YYYY' },
};

const DEFAULT_LOCALE = { locale: 'en', timezone: 'UTC', currency: 'USD', dateFormat: 'DD/MM/YYYY' };

/**
 * Lấy IP thực của client (ưu tiên X-Forwarded-For từ Nginx).
 */
const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    // X-Forwarded-For có thể là "client, proxy1, proxy2"
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || req.connection?.remoteAddress || '127.0.0.1';
};

/**
 * Resolve country code từ IP.
 * Dùng Intl API của Node 18+ + ip-based heuristics đơn giản.
 * Nếu muốn chính xác hơn, tích hợp `maxmind/geoip-lite`.
 */
const resolveCountryFromIp = async (ip) => {
  // Localhost / private → fallback
  if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('::ffff:127')) {
    return null;
  }

  try {
    // Dùng free API ip-api.com (không cần API key, 45 req/min miễn phí)
    // Timeout 2s để không block response
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,countryCode`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data.status === 'success') return data.countryCode;
    }
  } catch {
    // Timeout hoặc lỗi mạng → fallback, không ảnh hưởng response
  }
  return null;
};

/**
 * GET /api/config/locale
 * Trả về locale, timezone, country, dateFormat cho frontend.
 */
export const getLocale = async (req, res) => {
  try {
    const ip = getClientIp(req);
    const countryCode = await resolveCountryFromIp(ip);

    const localeData = (countryCode && COUNTRY_LOCALE_MAP[countryCode]) || DEFAULT_LOCALE;

    return res.json({
      status: true,
      data: {
        locale:     localeData.locale,
        timezone:   localeData.timezone,
        country:    countryCode || 'UNKNOWN',
        currency:   localeData.currency,
        dateFormat: localeData.dateFormat,
        resolved_at: Date.now(),
      },
    });
  } catch (err) {
    // Luôn trả về fallback, không để lỗi block UI
    return res.json({
      status: true,
      data: {
        locale:   DEFAULT_LOCALE.locale,
        timezone: DEFAULT_LOCALE.timezone,
        country:  'UNKNOWN',
        currency: DEFAULT_LOCALE.currency,
        dateFormat: DEFAULT_LOCALE.dateFormat,
      },
    });
  }
};
