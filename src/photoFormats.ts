export interface PhotoFormat {
  id: string
  country: { en: string; zh: string }
  flag: string
  label: { en: string; zh: string }
  width: number    // mm
  height: number   // mm
  headMin: number  // mm — head height min (chin to crown)
  headMax: number  // mm — head height max
  topMarginMin: number  // mm — top of photo to top of head
  topMarginMax: number  // mm
  chinMarginMin: number // mm — chin to bottom edge
}

export const FORMATS: PhotoFormat[] = [
  {
    id: 'cn-passport',
    country: { en: 'China', zh: '中国' },
    flag: '🇨🇳',
    label: { en: 'Passport', zh: '护照' },
    width: 33, height: 48,
    headMin: 28, headMax: 33,
    topMarginMin: 3, topMarginMax: 5,
    chinMarginMin: 7,
  },
  {
    id: 'cn-id',
    country: { en: 'China', zh: '中国' },
    flag: '🇨🇳',
    label: { en: 'ID Card', zh: '居民身份证' },
    width: 26, height: 32,
    headMin: 15, headMax: 22,
    topMarginMin: 3, topMarginMax: 5,
    chinMarginMin: 3,
  },
  {
    id: 'us-passport',
    country: { en: 'USA', zh: '美国' },
    flag: '🇺🇸',
    label: { en: 'Passport', zh: '护照' },
    width: 51, height: 51,
    headMin: 25, headMax: 35,
    topMarginMin: 3, topMarginMax: 8,
    chinMarginMin: 8,
  },
  {
    id: 'uk-passport',
    country: { en: 'UK', zh: '英国' },
    flag: '🇬🇧',
    label: { en: 'Passport', zh: '护照' },
    width: 35, height: 45,
    headMin: 29, headMax: 34,
    topMarginMin: 2, topMarginMax: 6,
    chinMarginMin: 5,
  },
  {
    id: 'eu-passport',
    country: { en: 'EU / Schengen', zh: '欧盟/申根' },
    flag: '🇪🇺',
    label: { en: 'Passport', zh: '护照' },
    width: 35, height: 45,
    headMin: 32, headMax: 36,
    topMarginMin: 2, topMarginMax: 6,
    chinMarginMin: 5,
  },
  {
    id: 'au-passport',
    country: { en: 'Australia', zh: '澳大利亚' },
    flag: '🇦🇺',
    label: { en: 'Passport', zh: '护照' },
    width: 35, height: 45,
    headMin: 32, headMax: 36,
    topMarginMin: 3, topMarginMax: 6,
    chinMarginMin: 5,
  },
  {
    id: 'nz-passport',
    country: { en: 'New Zealand', zh: '新西兰' },
    flag: '🇳🇿',
    label: { en: 'Passport', zh: '护照' },
    width: 35, height: 45,
    headMin: 32, headMax: 36,
    topMarginMin: 3, topMarginMax: 6,
    chinMarginMin: 5,
  },
  {
    id: 'jp-passport',
    country: { en: 'Japan', zh: '日本' },
    flag: '🇯🇵',
    label: { en: 'Passport', zh: '护照' },
    width: 35, height: 45,
    headMin: 32, headMax: 36,
    topMarginMin: 2, topMarginMax: 6,
    chinMarginMin: 5,
  },
  {
    id: 'ca-passport',
    country: { en: 'Canada', zh: '加拿大' },
    flag: '🇨🇦',
    label: { en: 'Passport', zh: '护照' },
    width: 50, height: 70,
    headMin: 31, headMax: 36,
    topMarginMin: 3, topMarginMax: 9,
    chinMarginMin: 7,
  },
]

export const DEFAULT_FORMAT = FORMATS[0] // cn-passport
