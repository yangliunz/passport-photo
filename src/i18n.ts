export type Lang = 'en' | 'zh'

export const T = {
  appTitle: { en: 'ID Photo Generator', zh: '证件照生成器' },
  step1: { en: 'Upload', zh: '上传照片' },
  step2: { en: 'Crop', zh: '调整裁剪' },
  step3: { en: 'Download', zh: '下载' },
  upload: { en: 'Upload Photo', zh: '上传照片' },
  uploadHint: { en: 'Click or drag image here', zh: '点击或拖拽图片到此处' },
  uploadFormats: { en: 'JPG, PNG, WEBP, HEIC', zh: '支持 JPG、PNG、WEBP、HEIC' },
  uploadError: { en: 'Unsupported format. Please use JPG, PNG or WEBP.', zh: '不支持的文件格式，请上传 JPG、PNG 或 WEBP' },
  selectFormat: { en: 'Select Format', zh: '选择证件类型' },
  adjustCrop: { en: 'Adjust Crop', zh: '调整裁剪' },
  adjustHint: { en: 'Drag to position · scroll or slider to zoom', zh: '拖动移位，滚轮或滑块缩放，对齐头部到框内' },
  reupload: { en: 'Re-upload', zh: '重新上传' },
  reset: { en: 'Reset', zh: '重置' },
  generate: { en: 'Generate', zh: '生成证件照' },
  fineTune: { en: 'Fine', zh: '微调' },
  downloadSingle: { en: 'Single Photo', zh: '单张下载' },
  downloadLayout: { en: 'Print Layout', zh: '排版下载' },
  readjust: { en: 'Re-adjust', zh: '重新调整' },
  printHint: { en: 'Print at actual size on 4×6in (10×15cm) paper.', zh: '以10×15cm（4×6英寸）实际尺寸打印，每张照片将为标准尺寸。' },
  singlePreview: { en: 'Preview', zh: '单张预览' },
  crownLine: { en: 'Crown', zh: '发顶' },
  chinLine: { en: 'Chin', zh: '下颌' },
  headWidth: { en: 'Min width', zh: '头宽≥' },
  size: { en: 'Size', zh: '尺寸' },
  photos4x6: { en: '4×6in · 300dpi', zh: '4×6英寸 · 300dpi' },
} as const

export function t(key: keyof typeof T, lang: Lang): string {
  return T[key][lang]
}
