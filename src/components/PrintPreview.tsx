import { useRef, useEffect, useMemo } from 'react'
import { Download, ArrowLeft } from 'lucide-react'
import { type Lang, t } from '../i18n'
import { type PhotoFormat } from '../photoFormats'

const DPI = 300
const PX_PER_MM = DPI / 25.4
const PRINT_W_MM = 152.4  // 6 inch
const PRINT_H_MM = 101.6  // 4 inch
const GAP_MM = 2
const PREVIEW_SCALE = 0.38

interface Props {
  photoCrop: string
  onBack: () => void
  lang: Lang
  format: PhotoFormat
}

export default function PrintPreview({ photoCrop, onBack, lang, format }: Props) {
  const previewRef = useRef<HTMLCanvasElement>(null)

  const layout = useMemo(() => {
    const photoW = Math.round(format.width * PX_PER_MM)
    const photoH = Math.round(format.height * PX_PER_MM)
    const gap = Math.round(GAP_MM * PX_PER_MM)
    const cols = Math.floor((PRINT_W_MM + GAP_MM) / (format.width + GAP_MM))
    const rows = Math.floor((PRINT_H_MM + GAP_MM) / (format.height + GAP_MM))
    const printW = Math.round(PRINT_W_MM * PX_PER_MM)
    const printH = Math.round(PRINT_H_MM * PX_PER_MM)
    const marginX = Math.floor((printW - cols * photoW - (cols - 1) * gap) / 2)
    const marginY = Math.floor((printH - rows * photoH - (rows - 1) * gap) / 2)
    return { photoW, photoH, gap, cols, rows, printW, printH, marginX, marginY }
  }, [format])

  useEffect(() => {
    const canvas = previewRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    img.onload = () => drawLayout(ctx, img)
    img.src = photoCrop
  }, [photoCrop, layout])

  function drawLayout(ctx: CanvasRenderingContext2D, img: HTMLImageElement, scale = 1) {
    const { photoW, photoH, gap, cols, rows, printW, printH, marginX, marginY } = layout
    const w = Math.round(printW * scale)
    const h = Math.round(printH * scale)
    const canvas = ctx.canvas
    canvas.width = w
    canvas.height = h
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, w, h)

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const dx = Math.round((marginX + col * (photoW + gap)) * scale)
        const dy = Math.round((marginY + row * (photoH + gap)) * scale)
        const dw = Math.round(photoW * scale)
        const dh = Math.round(photoH * scale)
        ctx.drawImage(img, dx, dy, dw, dh)
      }
    }
  }

  function handleDownloadLayout() {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    img.onload = () => {
      drawLayout(ctx, img, 1)
      const link = document.createElement('a')
      link.download = `证件照_${format.width}x${format.height}mm_4x6打印.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    }
    img.src = photoCrop
  }

  function handleDownloadSingle() {
    const link = document.createElement('a')
    link.download = `证件照_${format.width}x${format.height}mm.png`
    link.href = photoCrop
    link.click()
  }

  const previewW = Math.round(layout.printW * PREVIEW_SCALE)
  const previewH = Math.round(layout.printH * PREVIEW_SCALE)
  const photoCount = layout.cols * layout.rows

  // Single photo preview display size (scale to ~66px wide area)
  const previewSingleW = Math.round(66 * (format.width / 33))
  const previewSingleH = Math.round(previewSingleW * (format.height / format.width))

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8 gap-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-white">{t('downloadLayout', lang)}</h2>
        <p className="text-sm text-gray-400 mt-1">
          {t('photos4x6', lang)} · {photoCount} {lang === 'zh' ? '张' : 'photos'}
        </p>
      </div>

      {/* Print layout preview */}
      <div className="rounded-xl overflow-hidden border border-gray-700 shadow-2xl">
        <canvas
          ref={previewRef}
          width={previewW}
          height={previewH}
          style={{ display: 'block', width: previewW, height: previewH }}
        />
      </div>

      <p className="text-xs text-gray-500 text-center max-w-xs">
        {t('printHint', lang)}
      </p>

      {/* Single photo preview */}
      <div className="flex items-center gap-4">
        <div>
          <p className="text-xs text-gray-500 mb-2 text-center">{t('singlePreview', lang)}</p>
          <img
            src={photoCrop}
            alt=""
            className="rounded border border-gray-600"
            style={{ width: previewSingleW, height: previewSingleH }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('readjust', lang)}
        </button>
        <button
          onClick={handleDownloadSingle}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium transition-colors"
        >
          <Download className="w-4 h-4" />
          {t('downloadSingle', lang)} <span className="text-gray-400 text-xs">{format.width}×{format.height}mm</span>
        </button>
        <button
          onClick={handleDownloadLayout}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
        >
          <Download className="w-4 h-4" />
          {t('downloadLayout', lang)} <span className="text-blue-300 text-xs">4×6{lang === 'zh' ? '英寸' : 'in'}</span>
        </button>
      </div>
    </div>
  )
}
