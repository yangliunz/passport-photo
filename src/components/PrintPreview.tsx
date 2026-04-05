import { useRef, useEffect } from 'react'
import { Download, ArrowLeft } from 'lucide-react'

// Print layout constants at 300dpi
const PRINT_W = 1800   // 6 inches
const PRINT_H = 1200   // 4 inches
const PHOTO_W = 390    // 33mm at 300dpi
const PHOTO_H = 567    // 48mm at 300dpi
const COLS = 4
const ROWS = 2
const GAP = 10
const MARGIN_X = Math.floor((PRINT_W - COLS * PHOTO_W - (COLS - 1) * GAP) / 2)  // 105
const MARGIN_Y = Math.floor((PRINT_H - ROWS * PHOTO_H - (ROWS - 1) * GAP) / 2)  // 28

// Preview scale (fit in viewport)
const PREVIEW_SCALE = 0.38

interface Props {
  photoCrop: string
  onBack: () => void
}

export default function PrintPreview({ photoCrop, onBack }: Props) {
  const previewRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = previewRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    img.onload = () => drawLayout(ctx, img)
    img.src = photoCrop
  }, [photoCrop])

  function drawLayout(ctx: CanvasRenderingContext2D, img: HTMLImageElement, scale = 1) {
    const w = Math.round(PRINT_W * scale)
    const h = Math.round(PRINT_H * scale)
    const canvas = ctx.canvas
    canvas.width = w
    canvas.height = h
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, w, h)

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const dx = Math.round((MARGIN_X + col * (PHOTO_W + GAP)) * scale)
        const dy = Math.round((MARGIN_Y + row * (PHOTO_H + GAP)) * scale)
        const dw = Math.round(PHOTO_W * scale)
        const dh = Math.round(PHOTO_H * scale)
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
      link.download = '证件照_4x6打印.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
    }
    img.src = photoCrop
  }

  function handleDownloadSingle() {
    const link = document.createElement('a')
    link.download = '证件照_33x48mm.png'
    link.href = photoCrop
    link.click()
  }

  const previewW = Math.round(PRINT_W * PREVIEW_SCALE)
  const previewH = Math.round(PRINT_H * PREVIEW_SCALE)

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8 gap-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-white">下载打印版</h2>
        <p className="text-sm text-gray-400 mt-1">4×6英寸 · 300dpi · 8张证件照排版</p>
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
        预览为缩略图。下载后以 10×15cm（4×6英寸）实际尺寸打印，每张照片将为标准 33×48mm。
      </p>

      {/* Single photo preview */}
      <div className="flex items-center gap-4">
        <div>
          <p className="text-xs text-gray-500 mb-2 text-center">单张预览</p>
          <img
            src={photoCrop}
            alt="裁剪预览"
            className="rounded border border-gray-600"
            style={{ width: 66, height: 96 }}
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
          重新调整
        </button>
        <button
          onClick={handleDownloadSingle}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium transition-colors"
        >
          <Download className="w-4 h-4" />
          单张下载 <span className="text-gray-400 text-xs">33×48mm</span>
        </button>
        <button
          onClick={handleDownloadLayout}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
        >
          <Download className="w-4 h-4" />
          排版下载 <span className="text-blue-300 text-xs">4×6英寸</span>
        </button>
      </div>
    </div>
  )
}
