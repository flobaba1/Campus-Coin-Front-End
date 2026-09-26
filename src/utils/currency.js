/* CampusCoin worldwide currency service — safe browser implementation. */
const COUNTRY_TO_CURRENCY = {
  // Africa
  DZ:'DZD', AO:'AOA', BJ:'XOF', BW:'BWP', BF:'XOF', BI:'BIF', CV:'CVE', CM:'XAF',
  CF:'XAF', TD:'XAF', KM:'KMF', CG:'XAF', CD:'CDF', CI:'XOF', DJ:'DJF', EG:'EGP',
  GQ:'XAF', ER:'ERN', SZ:'SZL', ET:'ETB', GA:'XAF', GM:'GMD', GH:'GHS', GN:'GNF',
  GW:'XOF', KE:'KES', LS:'LSL', LR:'LRD', LY:'LYD', MG:'MGA', MW:'MWK', ML:'XOF',
  MR:'MRU', MU:'MUR', MA:'MAD', MZ:'MZN', NA:'NAD', NE:'XOF', NG:'NGN', RW:'RWF',
  ST:'STN', SN:'XOF', SC:'SCR', SL:'SLE', SO:'SOS', ZA:'ZAR', SS:'SSP', SD:'SDG',
  TZ:'TZS', TG:'XOF', TN:'TND', UG:'UGX', ZM:'ZMW', ZW:'ZWG', EH:'MAD',

  // Americas and Caribbean
  AG:'XCD', AR:'ARS', AW:'AWG', BS:'BSD', BB:'BBD', BZ:'BZD', BM:'BMD', BO:'BOB',
  BR:'BRL', CA:'CAD', KY:'KYD', CL:'CLP', CO:'COP', CR:'CRC', CU:'CUP', CW:'ANG',
  DM:'XCD', DO:'DOP', EC:'USD', SV:'USD', FK:'FKP', GF:'EUR', GD:'XCD', GP:'EUR',
  GT:'GTQ', GY:'GYD', HT:'HTG', HN:'HNL', JM:'JMD', MQ:'EUR', MX:'MXN', MS:'XCD',
  NI:'NIO', PA:'PAB', PY:'PYG', PE:'PEN', PR:'USD', BL:'EUR', KN:'XCD', LC:'XCD',
  MF:'EUR', PM:'EUR', VC:'XCD', SX:'ANG', SR:'SRD', TT:'TTD', TC:'USD', US:'USD',
  UY:'UYU', VE:'VES', VG:'USD', VI:'USD', BQ:'USD', AI:'XCD', UM:'USD', AS:'USD',
  GU:'USD', MP:'USD', DO:'DOP',

  // Europe
  AL:'ALL', AD:'EUR', AT:'EUR', BY:'BYN', BE:'EUR', BA:'BAM', BG:'BGN', HR:'EUR',
  CY:'EUR', CZ:'CZK', DK:'DKK', EE:'EUR', FO:'DKK', FI:'EUR', FR:'EUR', DE:'EUR',
  GI:'GIP', GR:'EUR', GG:'GBP', HU:'HUF', IS:'ISK', IE:'EUR', IM:'GBP', IT:'EUR',
  JE:'GBP', XK:'EUR', LV:'EUR', LI:'CHF', LT:'EUR', LU:'EUR', MT:'EUR', MC:'EUR',
  MD:'MDL', ME:'EUR', NL:'EUR', MK:'MKD', NO:'NOK', PL:'PLN', PT:'EUR', RO:'RON',
  RU:'RUB', SM:'EUR', RS:'RSD', SK:'EUR', SI:'EUR', ES:'EUR', SJ:'NOK', SE:'SEK',
  CH:'CHF', UA:'UAH', GB:'GBP', VA:'EUR', AX:'EUR',

  // Middle East and Central Asia
  AF:'AFN', AM:'AMD', AZ:'AZN', BH:'BHD', BD:'BDT', BT:'BTN', BN:'BND', KH:'KHR',
  CN:'CNY', KR:'KRW', GE:'GEL', HK:'HKD', IN:'INR', ID:'IDR', IR:'IRR', IQ:'IQD', IL:'ILS',
  JP:'JPY', JO:'JOD', KZ:'KZT', KW:'KWD', KG:'KGS', LA:'LAK', LB:'LBP', MO:'MOP',
  MY:'MYR', MV:'MVR', MN:'MNT', MM:'MMK', NP:'NPR', KP:'KPW', OM:'OMR', PK:'PKR',
  PS:'ILS', PH:'PHP', QA:'QAR', SA:'SAR', SG:'SGD', LK:'LKR', SY:'SYP', TW:'TWD',
  TJ:'TJS', TH:'THB', TL:'USD', TR:'TRY', TM:'TMT', AE:'AED', UZ:'UZS', VN:'VND',
  YE:'YER',

  // Oceania / Pacific
  AU:'AUD', FJ:'FJD', KI:'AUD', MH:'USD', FM:'USD', NR:'AUD', NZ:'NZD', PW:'USD',
  PG:'PGK', WS:'WST', SB:'SBD', TO:'TOP', TV:'AUD', VU:'VUV', NC:'XPF', PF:'XPF',
  WF:'XPF', CK:'NZD', NU:'NZD', TK:'NZD', PN:'NZD', NF:'AUD', CX:'AUD', CC:'AUD',
  NU:'NZD',

  // Additional territories / special cases
  AQ:'USD', BV:'NOK', HM:'AUD', IO:'USD', SH:'SHP', TA:'SHP', GS:'GBP', TF:'EUR'
}

const REGION_TO_CURRENCY = {
  US:'USD', GB:'GBP', CA:'CAD', AU:'AUD', NZ:'NZD', JP:'JPY', CN:'CNY', IN:'INR', KR:'KRW',
  NG:'NGN', GH:'GHS', KE:'KES', ZA:'ZAR', AE:'AED', SA:'SAR', CH:'CHF', TR:'TRY', BR:'BRL',
  MX:'MXN', HK:'HKD', SG:'SGD', IL:'ILS', EG:'EGP',
  ...COUNTRY_TO_CURRENCY
}

const TIMEZONE_TO_REGION = [
  [/^Africa\/Lagos/, 'NG'], [/^Africa\/Accra/, 'GH'], [/^Africa\/Nairobi/, 'KE'],
  [/^Africa\/Johannesburg/, 'ZA'], [/^Africa\/Cairo/, 'EG'], [/^Africa\/Casablanca/, 'MA'],
  [/^Europe\/London/, 'GB'], [/^Europe\/Dublin/, 'IE'], [/^Europe\/Lisbon/, 'PT'],
  [/^Europe\/Paris/, 'FR'], [/^Europe\/Berlin/, 'DE'], [/^Europe\/Madrid/, 'ES'],
  [/^Europe\/Rome/, 'IT'], [/^Europe\/Amsterdam/, 'NL'], [/^Europe\/Zurich/, 'CH'],
  [/^Europe\/Stockholm/, 'SE'], [/^Europe\/Oslo/, 'NO'], [/^Europe\/Copenhagen/, 'DK'],
  [/^Europe\/Warsaw/, 'PL'], [/^Europe\/Athens/, 'GR'], [/^Europe\/Helsinki/, 'FI'],
  [/^America\/Toronto/, 'CA'], [/^America\/Vancouver/, 'CA'], [/^America\/Edmonton/, 'CA'],
  [/^America\/Winnipeg/, 'CA'], [/^America\/Halifax/, 'CA'], [/^America\/New_York/, 'US'],
  [/^America\/Chicago/, 'US'], [/^America\/Denver/, 'US'], [/^America\/Los_Angeles/, 'US'],
  [/^America\/Anchorage/, 'US'], [/^America\/Phoenix/, 'US'], [/^Asia\/Tokyo/, 'JP'],
  [/^Asia\/Shanghai/, 'CN'], [/^Asia\/Hong_Kong/, 'HK'], [/^Asia\/Kolkata/, 'IN'],
  [/^Asia\/Singapore/, 'SG'], [/^Asia\/Seoul/, 'KR'], [/^Asia\/Dubai/, 'AE'],
  [/^Asia\/Riyadh/, 'SA'], [/^Asia\/Jerusalem/, 'IL'], [/^Asia\/Istanbul/, 'TR'],
  [/^Australia\//, 'AU'], [/^Pacific\/Auckland/, 'NZ']
]



const REGION_LOCALE_OVERRIDES = {
  NG:'en-NG', US:'en-US', GB:'en-GB', CA:'en-CA', AU:'en-AU', NZ:'en-NZ',
  GH:'en-GH', KE:'en-KE', ZA:'en-ZA', IN:'en-IN', JP:'ja-JP', CN:'zh-CN',
  KR:'ko-KR', BR:'pt-BR', MX:'es-MX', ES:'es-ES', FR:'fr-FR', DE:'de-DE',
  IT:'it-IT', PT:'pt-PT', NL:'nl-NL', CH:'de-CH', AE:'ar-AE', SA:'ar-SA',
  TR:'tr-TR', ID:'id-ID', MY:'ms-MY', TH:'th-TH', VN:'vi-VN', PH:'en-PH',
  RU:'ru-RU', UA:'uk-UA', PL:'pl-PL', SE:'sv-SE', NO:'nb-NO', DK:'da-DK',
  FI:'fi-FI', GR:'el-GR', IL:'he-IL'
}

const CURRENCY_FALLBACK_LOCALES = {
  USD:'en-US', EUR:'en-IE', GBP:'en-GB', NGN:'en-NG', CAD:'en-CA', AUD:'en-AU', NZD:'en-NZ',
  GHS:'en-GH', KES:'en-KE', ZAR:'en-ZA', INR:'en-IN', JPY:'ja-JP', CNY:'zh-CN', KRW:'ko-KR',
  BRL:'pt-BR', MXN:'es-MX', CHF:'de-CH', AED:'ar-AE', SAR:'ar-SA', TRY:'tr-TR', SGD:'en-SG', HKD:'zh-HK'
}

function storageGet(storage, key) { try { return storage?.getItem(key) || '' } catch { return '' } }
function storageSet(storage, key, value) { try { storage?.setItem(key, value) } catch {} }

function isCurrencySupported(code) {
  try { new Intl.NumberFormat('en-US', { style:'currency', currency:code }).format(1); return true }
  catch { return false }
}

function regionFromLocale() {
  try {
    const locale = navigator?.language || 'en-US'
    const region = typeof Intl.Locale === 'function' ? new Intl.Locale(locale).region : ''
    if (region) return region.toUpperCase()
  } catch {}
  const locale = typeof navigator !== 'undefined' ? (navigator.language || '') : ''
  return locale.match(/[-_]([A-Za-z]{2}|\d{3})$/)?.[1]?.toUpperCase() || ''
}

function regionFromTimezone() {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
    return TIMEZONE_TO_REGION.find(([pattern]) => pattern.test(timezone))?.[1] || ''
  } catch { return '' }
}

export function getCurrencyForCountry(countryCode) {
  const country = String(countryCode || '').trim().toUpperCase()
  return COUNTRY_TO_CURRENCY[country] || null
}

export function detectCurrencyCode() {
  const saved = storageGet(typeof localStorage !== 'undefined' ? localStorage : null, 'campuscoin.currency').toUpperCase()
  if (saved && isCurrencySupported(saved)) return saved
  const region = regionFromLocale()
  const currency = REGION_TO_CURRENCY[region]
  if (currency && isCurrencySupported(currency)) return currency
  const tzRegion = regionFromTimezone()
  const tzCurrency = REGION_TO_CURRENCY[tzRegion]
  if (tzCurrency && isCurrencySupported(tzCurrency)) return tzCurrency
  return 'USD'
}

function localeForCurrency(code) {
  const regions = Object.entries(COUNTRY_TO_CURRENCY)
    .filter(([, currency]) => currency === code)
    .map(([region]) => region)
  const region = regions.find(r => REGION_LOCALE_OVERRIDES[r]) || regions[0] || 'US'
  return REGION_LOCALE_OVERRIDES[region] || CURRENCY_FALLBACK_LOCALES[code] || 'en-US'
}

export function getCurrencyInfo(code = detectCurrencyCode()) {
  const requested = String(code || 'USD').toUpperCase()
  const safeCode = isCurrencySupported(requested) ? requested : 'USD'
  const locale = localeForCurrency(safeCode)
  let symbol = safeCode
  try {
    symbol = new Intl.NumberFormat(locale, { style:'currency', currency:safeCode }).formatToParts(1).find(p => p.type === 'currency')?.value || safeCode
  } catch {}
  let name = safeCode
  try {
    if (typeof Intl.DisplayNames === 'function') name = new Intl.DisplayNames([locale], { type:'currency' }).of(safeCode) || safeCode
  } catch {}
  return { code:safeCode, symbol, name, locale }
}

export async function detectCurrencyFromAccess() {
  const fallback = detectCurrencyCode()
  const cached = storageGet(typeof sessionStorage !== 'undefined' ? sessionStorage : null, 'campuscoin.country')
  if (cached) return getCurrencyForCountry(cached) || fallback
  const endpoints = [
    ['https://ipapi.co/json/', d => d.country_code],
    ['https://ipwho.is/', d => d.country_code]
  ]
  for (const [url, readCountry] of endpoints) {
    try {
      const controller = typeof AbortController === 'function' ? new AbortController() : null
      const timeout = controller ? setTimeout(() => controller.abort(), 3500) : null
      const response = await fetch(url, { cache:'no-store', signal:controller?.signal })
      if (timeout) clearTimeout(timeout)
      if (!response.ok) continue
      const data = await response.json()
      const country = String(readCountry(data) || '').toUpperCase()
      const currency = getCurrencyForCountry(country)
      if (country) storageSet(typeof sessionStorage !== 'undefined' ? sessionStorage : null, 'campuscoin.country', country)
      if (currency && isCurrencySupported(currency)) return currency
    } catch {}
  }
  return fallback
}

export function setCurrencyCode(code) {
  const currency = String(code || '').toUpperCase()
  if (!isCurrencySupported(currency)) return
  storageSet(typeof localStorage !== 'undefined' ? localStorage : null, 'campuscoin.currency', currency)
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('campuscoin-currency-change', { detail: { code:currency } }))
}

export function formatMoney(value, options = {}) {
  const info = getCurrencyInfo(options.code)
  return new Intl.NumberFormat(info.locale, { style:'currency', currency:info.code, minimumFractionDigits:2, maximumFractionDigits:2 }).format(Number(value) || 0)
}

export function localizeCurrencyText(text) {
  if (typeof text !== 'string' || !text.includes('$')) return text
  return text.replace(/\$/g, getCurrencyInfo().symbol)
}

export function localizeCurrencyDom(root = typeof document !== 'undefined' ? document.body : null) {
  if (!root || typeof document === 'undefined') return
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const nodes = []
  let node
  while ((node = walker.nextNode())) {
    const parent = node.parentElement
    if (!parent || ['SCRIPT','STYLE','NOSCRIPT','OPTION'].includes(parent.tagName)) continue
    if (node.nodeValue?.includes('$')) nodes.push(node)
  }
  nodes.forEach(n => { n.nodeValue = localizeCurrencyText(n.nodeValue) })
  root.querySelectorAll?.('input,textarea').forEach(el => {
    if (typeof el.value === 'string' && el.value.includes('$') && el.type !== 'password') el.value = localizeCurrencyText(el.value)
    if (typeof el.placeholder === 'string' && el.placeholder.includes('$')) el.placeholder = localizeCurrencyText(el.placeholder)
  })
}
