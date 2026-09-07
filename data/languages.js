/**
 * Complete list of Google Search supported languages.
 * Used for Google Search 'hl' (host language) and 'lr' (language restrict) parameters.
 */
const GOOGLE_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "ur", name: "Urdu", nativeName: "اردو" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "de", name: "German", nativeName: "Deutsch" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "it", name: "Italian", nativeName: "Italiano" },
  { code: "pt-BR", name: "Portuguese (Brazil)", nativeName: "Português (Brasil)" },
  { code: "pt-PT", name: "Portuguese (Portugal)", nativeName: "Português (Portugal)" },
  { code: "ru", name: "Russian", nativeName: "Русский" },
  { code: "ja", name: "Japanese", nativeName: "日本語" },
  { code: "zh-CN", name: "Chinese (Simplified)", nativeName: "简体中文" },
  { code: "zh-TW", name: "Chinese (Traditional)", nativeName: "繁體中文" },
  { code: "ko", name: "Korean", nativeName: "한국어" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands" },
  { code: "pl", name: "Polish", nativeName: "Polski" },
  { code: "sv", name: "Swedish", nativeName: "Svenska" },
  { code: "no", name: "Norwegian", nativeName: "Norsk" },
  { code: "da", name: "Danish", nativeName: "Dansk" },
  { code: "fi", name: "Finnish", nativeName: "Suomi" },
  { code: "cs", name: "Czech", nativeName: "Čeština" },
  { code: "el", name: "Greek", nativeName: "Ελληνικά" },
  { code: "ro", name: "Romanian", nativeName: "Română" },
  { code: "hu", name: "Hungarian", nativeName: "Magyar" },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia" },
  { code: "ms", name: "Malay", nativeName: "Bahasa Melayu" },
  { code: "th", name: "Thai", nativeName: "ไทย" },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt" },
  { code: "uk", name: "Ukrainian", nativeName: "Українська" },
  { code: "he", name: "Hebrew", nativeName: "עברית" },
  { code: "fa", name: "Persian (Farsi)", nativeName: "فارسی" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
  { code: "ne", name: "Nepali", nativeName: "नेपाली" },
  { code: "si", name: "Sinhala", nativeName: "සිංහල" },
  { code: "my", name: "Burmese", nativeName: "မြန်မာ" },
  { code: "km", name: "Khmer", nativeName: "ខ្មែរ" },
  { code: "fil", name: "Filipino / Tagalog", nativeName: "Filipino" },
  { code: "af", name: "Afrikaans", nativeName: "Afrikaans" },
  { code: "sq", name: "Albanian", nativeName: "Shqip" },
  { code: "am", name: "Amharic", nativeName: "አማርኛ" },
  { code: "hy", name: "Armenian", nativeName: "Հայերեն" },
  { code: "az", name: "Azerbaijani", nativeName: "Azərbaycan dili" },
  { code: "eu", name: "Basque", nativeName: "Euskara" },
  { code: "be", name: "Belarusian", nativeName: "Беларуская" },
  { code: "bs", name: "Bosnian", nativeName: "Bosanski" },
  { code: "bg", name: "Bulgarian", nativeName: "Български" },
  { code: "ca", name: "Catalan", nativeName: "Català" },
  { code: "hr", name: "Croatian", nativeName: "Hrvatski" },
  { code: "et", name: "Estonian", nativeName: "Eesti" },
  { code: "gl", name: "Galician", nativeName: "Galego" },
  { code: "ka", name: "Georgian", nativeName: "ქართული" },
  { code: "is", name: "Icelandic", nativeName: "Íslenska" },
  { code: "ga", name: "Irish", nativeName: "Gaeilge" },
  { code: "kk", name: "Kazakh", nativeName: "Қазақ тілі" },
  { code: "ky", name: "Kyrgyz", nativeName: "Кыргызча" },
  { code: "lo", name: "Lao", nativeName: "ລາວ" },
  { code: "lv", name: "Latvian", nativeName: "Latviešu" },
  { code: "lt", name: "Lithuanian", nativeName: "Lietuvių" },
  { code: "mk", name: "Macedonian", nativeName: "Македонски" },
  { code: "mn", name: "Mongolian", nativeName: "Монгол" },
  { code: "ps", name: "Pashto", nativeName: "پښتو" },
  { code: "sd", name: "Sindhi", nativeName: "سنڌي" },
  { code: "sk", name: "Slovak", nativeName: "Slovenčina" },
  { code: "sl", name: "Slovenian", nativeName: "Slovenščina" },
  { code: "so", name: "Somali", nativeName: "Soomaali" },
  { code: "sw", name: "Swahili", nativeName: "Kiswahili" },
  { code: "tg", name: "Tajik", nativeName: "Тоҷикӣ" },
  { code: "uz", name: "Uzbek", nativeName: "Oʻzbekcha" },
  { code: "cy", name: "Welsh", nativeName: "Cymraeg" },
  { code: "zu", name: "Zulu", nativeName: "isiZulu" }
];

/**
 * Derives Google Search 'lr' (language restrict) parameter correctly.
 * Maps regional variants to valid Google lr values (e.g. pt-BR -> lang_pt).
 */
function getGoogleLrCode(langCode) {
  if (!langCode) return 'lang_en';
  const mapping = {
    'pt-BR': 'lang_pt',
    'pt-PT': 'lang_pt',
    'zh-CN': 'lang_zh-CN',
    'zh-TW': 'lang_zh-TW',
    'fil': 'lang_tl'
  };
  if (mapping[langCode]) return mapping[langCode];
  const base = langCode.split('-')[0].toLowerCase();
  return `lang_${base}`;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GOOGLE_LANGUAGES, getGoogleLrCode };
}
