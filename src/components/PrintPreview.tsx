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

      {/* Heading */}
      <div className="text-center">
        <h2 style={{ color: '#F1F5F9', fontSize: 18, fontWeight: 600, margin: 0 }}>
          {t('downloadLayout', lang)}
        </h2>
        <p style={{ color: '#475569', fontSize: 13, marginTop: 4 }}>
          {t('photos4x6', lang)} · {photoCount} {lang === 'zh' ? '张' : 'photos'}
        </p>
      </div>

      {/* Print layout preview — paper shadow */}
      <div
        style={{
          borderRadius: 10,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
        }}
      >
        <canvas
          ref={previewRef}
          width={previewW}
          height={previewH}
          style={{ display: 'block', width: previewW, height: previewH }}
        />
      </div>

      <p style={{ fontSize: 11, color: '#334155', textAlign: 'center', maxWidth: 280 }}>
        {t('printHint', lang)}
      </p>

      {/* Single photo preview — physical photo look */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div>
          <p style={{ fontSize: 11, color: '#475569', marginBottom: 8, textAlign: 'center' }}>
            {t('singlePreview', lang)}
          </p>
          <div
            style={{
              display: 'inline-block',
              background: '#fff',
              padding: '5px 5px 14px 5px',
              borderRadius: 3,
              boxShadow: '0 8px 24px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.3)',
            }}
          >
            <img
              src={photoCrop}
              alt=""
              style={{ display: 'block', width: previewSingleW, height: previewSingleH }}
            />
          </div>
        </div>

        {/* Ready badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: '6px 12px',
            borderRadius: 20,
            background: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.2)',
            fontSize: 12,
            color: '#4ADE80',
            fontWeight: 500,
            whiteSpace: 'nowrap',
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {lang === 'zh' ? '可以打印' : 'Ready to print'}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10, width: '100%', maxWidth: 400 }}>
        {/* Back */}
        <button
          onClick={onBack}
          style={{
            minHeight: 44,
            padding: '0 18px',
            borderRadius: 12,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#94A3B8',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'all 0.18s ease',
          }}
        >
          <ArrowLeft style={{ width: 15, height: 15 }} />
          {t('readjust', lang)}
        </button>

        {/* Download single — outlined secondary */}
        <button
          onClick={handleDownloadSingle}
          style={{
            minHeight: 44,
            padding: '0 18px',
            borderRadius: 12,
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.14)',
            color: '#CBD5E1',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'all 0.18s ease',
          }}
        >
          <Download style={{ width: 15, height: 15 }} />
          {t('downloadSingle', lang)}
          <span style={{ color: '#64748B', fontSize: 11 }}>{format.width}×{format.height}mm</span>
        </button>

        {/* Download layout — primary */}
        <button
          onClick={handleDownloadLayout}
          style={{
            minHeight: 44,
            padding: '0 22px',
            borderRadius: 12,
            background: '#3B82F6',
            border: 'none',
            color: '#fff',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            boxShadow: '0 0 20px rgba(59,130,246,0.4)',
            transition: 'all 0.18s ease',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.02)'
            ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 28px rgba(59,130,246,0.6)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
            ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 20px rgba(59,130,246,0.4)'
          }}
          onMouseDown={e => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.98)'
          }}
          onMouseUp={e => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.02)'
          }}
        >
          <Download style={{ width: 15, height: 15, filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.5))' }} />
          {t('downloadLayout', lang)}
          <span style={{ color: '#93C5FD', fontSize: 11 }}>4×6{lang === 'zh' ? '英寸' : 'in'}</span>
        </button>
      </div>
    </div>
  )
}
