import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { type Lang, t } from '../i18n'
import { type PhotoFormat } from '../photoFormats'

const VIEWPORT_W = 420
const VIEWPORT_H = 560
const MM_TO_PX_300DPI = 300 / 25.4  // 11.811

interface Props {
  imageSrc: string
  onGenerate: (dataUrl: string) => void
  onBack: () => void
  lang: Lang
  format: PhotoFormat
}

export default function PhotoEditor({ imageSrc, onGenerate, onBack, lang, format }: Props) {
  const imgRef = useRef<HTMLImageElement>(null)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgPos, setImgPos] = useState({ x: VIEWPORT_W / 2, y: VIEWPORT_H / 2 })
  const [imgScale, setImgScale] = useState(1)
  const [dragging, setDragging] = useState(false)
  const [showSilhouette, setShowSilhouette] = useState(true)
  const dragStart = useRef({ mx: 0, my: 0, px: 0, py: 0 })

  // Dynamic frame dimensions derived from format
  const { FRAME_W, FRAME_H, FRAME_X, FRAME_Y, OUTPUT_W, OUTPUT_H } = useMemo(() => {
    const scalePxPerMm = Math.min(
      (VIEWPORT_W * 0.7) / format.width,
      (VIEWPORT_H * 0.7) / format.height
    )
    const fw = Math.round(format.width * scalePxPerMm)
    const fh = Math.round(format.height * scalePxPerMm)
    const fx = Math.round((VIEWPORT_W - fw) / 2)
    const fy = Math.round((VIEWPORT_H - fh) / 2)
    const ow = Math.round(format.width * MM_TO_PX_300DPI)
    const oh = Math.round(format.height * MM_TO_PX_300DPI)
    return { FRAME_W: fw, FRAME_H: fh, FRAME_X: fx, FRAME_Y: fy, OUTPUT_W: ow, OUTPUT_H: oh }
  }, [format])

  // Guide line fractions derived from format specs
  const { crownFrac, chinFrac, headWidthInsetFrac, silhouetteCyFrac, silhouetteRyFrac } = useMemo(() => {
    const crown = format.topMarginMax / format.height
    const chin = (format.topMarginMax + format.headMax) / format.height
    const inset = ((format.width - format.headMin) / 2) / format.width
    const cy = (crown + chin) / 2
    const ry = (chin - crown) / 2
    return { crownFrac: crown, chinFrac: chin, headWidthInsetFrac: inset, silhouetteCyFrac: cy, silhouetteRyFrac: ry }
  }, [format])

  function handleImgLoad() {
    const img = imgRef.current
    if (!img) return
    setImgLoaded(true)
    const initialScale = (FRAME_H / img.naturalHeight) * 1.2
    setImgScale(initialScale)
    setImgPos({ x: VIEWPORT_W / 2, y: VIEWPORT_H / 2 })
    setShowSilhouette(true)
  }

  // Reset when image source changes
  useEffect(() => {
    setImgLoaded(false)
  }, [imageSrc])

  // Reset position/scale when format changes (FRAME_H changes)
  useEffect(() => {
    const img = imgRef.current
    if (!img || !imgLoaded) return
    const initialScale = (FRAME_H / img.naturalHeight) * 1.2
    setImgScale(initialScale)
    setImgPos({ x: VIEWPORT_W / 2, y: VIEWPORT_H / 2 })
    setShowSilhouette(true)
  }, [FRAME_H, imgLoaded])

  const clampScale = (s: number) => Math.min(5, Math.max(0.05, s))

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setDragging(true)
    setShowSilhouette(false)
    dragStart.current = { mx: e.clientX, my: e.clientY, px: imgPos.x, py: imgPos.y }
  }, [imgPos])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return
    const dx = e.clientX - dragStart.current.mx
    const dy = e.clientY - dragStart.current.my
    setImgPos({ x: dragStart.current.px + dx, y: dragStart.current.py + dy })
  }, [dragging])

  const handleMouseUp = useCallback(() => setDragging(false), [])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    setShowSilhouette(false)
    setImgScale(s => clampScale(s - e.deltaY * 0.001))
  }, [])

  // Touch support
  const lastTouch = useRef<{ x: number; y: number } | null>(null)
  const lastPinchDist = useRef<number | null>(null)

  function getTouchDist(e: React.TouchEvent) {
    if (e.touches.length < 2) return null
    const dx = e.touches[0].clientX - e.touches[1].clientX
    const dy = e.touches[0].clientY - e.touches[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  function handleTouchStart(e: React.TouchEvent) {
    setShowSilhouette(false)
    if (e.touches.length === 1) {
      lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    } else {
      lastPinchDist.current = getTouchDist(e)
    }
  }

  function handleTouchMove(e: React.TouchEvent) {
    e.preventDefault()
    if (e.touches.length === 1 && lastTouch.current) {
      const dx = e.touches[0].clientX - lastTouch.current.x
      const dy = e.touches[0].clientY - lastTouch.current.y
      setImgPos(p => ({ x: p.x + dx, y: p.y + dy }))
      lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    } else if (e.touches.length === 2) {
      const dist = getTouchDist(e)
      if (dist && lastPinchDist.current) {
        const ratio = dist / lastPinchDist.current
        setImgScale(s => clampScale(s * ratio))
      }
      lastPinchDist.current = dist
    }
  }

  function handleTouchEnd() {
    lastTouch.current = null
    lastPinchDist.current = null
  }

  function handleReset() {
    if (!imgRef.current) return
    const initialScale = (FRAME_H / imgRef.current.naturalHeight) * 1.2
    setImgScale(initialScale)
    setImgPos({ x: VIEWPORT_W / 2, y: VIEWPORT_H / 2 })
    setShowSilhouette(true)
  }

  function generate() {
    const img = imgRef.current
    if (!img) return

    const canvas = document.createElement('canvas')
    canvas.width = OUTPUT_W
    canvas.height = OUTPUT_H
    const ctx = canvas.getContext('2d')!

    // Compute crop region in natural image coords
    const frameW_img = FRAME_W / imgScale
    const frameH_img = FRAME_H / imgScale
    const frameCenterX_img = (VIEWPORT_W / 2 - imgPos.x) / imgScale + img.naturalWidth / 2
    const frameCenterY_img = (VIEWPORT_H / 2 - imgPos.y) / imgScale + img.naturalHeight / 2

    const sx = frameCenterX_img - frameW_img / 2
    const sy = frameCenterY_img - frameH_img / 2

    // Clamp source rect to image bounds
    const sxClamped = Math.max(0, sx)
    const syClamped = Math.max(0, sy)
    const sxEnd = Math.min(img.naturalWidth, sx + frameW_img)
    const syEnd = Math.min(img.naturalHeight, sy + frameH_img)
    const sWidthClamped = sxEnd - sxClamped
    const sHeightClamped = syEnd - syClamped

    // Map clamped source rect to destination rect
    const dxOffset = ((sxClamped - sx) / frameW_img) * OUTPUT_W
    const dyOffset = ((syClamped - sy) / frameH_img) * OUTPUT_H
    const dWidth = (sWidthClamped / frameW_img) * OUTPUT_W
    const dHeight = (sHeightClamped / frameH_img) * OUTPUT_H

    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, OUTPUT_W, OUTPUT_H)

    if (sWidthClamped > 0 && sHeightClamped > 0) {
      ctx.drawImage(img, sxClamped, syClamped, sWidthClamped, sHeightClamped, dxOffset, dyOffset, dWidth, dHeight)
    }

    onGenerate(canvas.toDataURL('image/png'))
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8 gap-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-white">{t('adjustCrop', lang)}</h2>
        <p className="text-sm text-gray-400 mt-1">{t('adjustHint', lang)}</p>
        <p className="text-xs text-gray-500 mt-1">
          {format.flag} {format.country[lang]} {format.label[lang]} · {format.width}×{format.height}mm
        </p>
      </div>

      {/* Editor viewport */}
      <div
        className="relative rounded-xl overflow-hidden bg-gray-900 select-none"
        style={{ width: VIEWPORT_W, height: VIEWPORT_H, cursor: dragging ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Photo layer */}
        <img
          ref={imgRef}
          src={imageSrc}
          alt=""
          draggable={false}
          onLoad={handleImgLoad}
          style={{
            position: 'absolute',
            left: imgPos.x,
            top: imgPos.y,
            transform: `translate(-50%, -50%) scale(${imgScale})`,
            transformOrigin: 'center center',
            maxWidth: 'none',
            width: 'auto',
            height: 'auto',
            pointerEvents: 'none',
            userSelect: 'none',
            display: imgLoaded ? 'block' : 'none',
          }}
        />

        {/* Dark overlay outside frame using box-shadow */}
        <div
          style={{
            position: 'absolute',
            left: FRAME_X,
            top: FRAME_Y,
            width: FRAME_W,
            height: FRAME_H,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        />

        {/* Frame border */}
        <div
          style={{
            position: 'absolute',
            left: FRAME_X,
            top: FRAME_Y,
            width: FRAME_W,
            height: FRAME_H,
            border: '2px solid rgba(255,255,255,0.7)',
            pointerEvents: 'none',
            zIndex: 11,
          }}
        />

        {/* Crown guide line */}
        <div
          style={{
            position: 'absolute',
            left: FRAME_X,
            top: FRAME_Y + FRAME_H * crownFrac,
            width: FRAME_W,
            height: 0,
            borderTop: '1px dashed rgba(255,220,80,0.6)',
            pointerEvents: 'none',
            zIndex: 12,
          }}
        />
        {/* Chin guide line */}
        <div
          style={{
            position: 'absolute',
            left: FRAME_X,
            top: FRAME_Y + FRAME_H * chinFrac,
            width: FRAME_W,
            height: 0,
            borderTop: '1px dashed rgba(255,220,80,0.6)',
            pointerEvents: 'none',
            zIndex: 12,
          }}
        />

        {/* Head width guides — vertical */}
        <div
          style={{
            position: 'absolute',
            left: FRAME_X + FRAME_W * headWidthInsetFrac,
            top: FRAME_Y,
            width: 0,
            height: FRAME_H,
            borderLeft: '1px dashed rgba(100,180,255,0.45)',
            pointerEvents: 'none',
            zIndex: 12,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: FRAME_X + FRAME_W * (1 - headWidthInsetFrac),
            top: FRAME_Y,
            width: 0,
            height: FRAME_H,
            borderLeft: '1px dashed rgba(100,180,255,0.45)',
            pointerEvents: 'none',
            zIndex: 12,
          }}
        />

        {/* Guide labels */}
        <div style={{ position: 'absolute', left: FRAME_X + FRAME_W + 6, top: FRAME_Y + FRAME_H * crownFrac - 8, fontSize: 10, color: 'rgba(255,220,80,0.75)', pointerEvents: 'none', zIndex: 12, whiteSpace: 'nowrap' }}>
          {t('crownLine', lang)}
        </div>
        <div style={{ position: 'absolute', left: FRAME_X + FRAME_W + 6, top: FRAME_Y + FRAME_H * chinFrac - 8, fontSize: 10, color: 'rgba(255,220,80,0.75)', pointerEvents: 'none', zIndex: 12, whiteSpace: 'nowrap' }}>
          {t('chinLine', lang)}
        </div>
        <div style={{ position: 'absolute', left: FRAME_X + FRAME_W * headWidthInsetFrac + 2, top: FRAME_Y + 4, fontSize: 9, color: 'rgba(100,180,255,0.65)', pointerEvents: 'none', zIndex: 12, whiteSpace: 'nowrap' }}>
          {t('headWidth', lang)}{format.headMin}mm
        </div>

        {/* Head silhouette overlay */}
        {showSilhouette && (
          <svg
            style={{
              position: 'absolute',
              left: FRAME_X,
              top: FRAME_Y,
              width: FRAME_W,
              height: FRAME_H,
              pointerEvents: 'none',
              zIndex: 13,
            }}
            viewBox={`0 0 ${FRAME_W} ${FRAME_H}`}
          >
            <ellipse
              cx={FRAME_W / 2}
              cy={FRAME_H * silhouetteCyFrac}
              rx={FRAME_W * 0.30}
              ry={FRAME_H * silhouetteRyFrac}
              fill="rgba(255,255,255,0.08)"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
            {/* Neck + shoulders hint */}
            <path
              d={`M ${FRAME_W * 0.35} ${FRAME_H * chinFrac * 0.93} Q ${FRAME_W * 0.5} ${FRAME_H * chinFrac} ${FRAME_W * 0.65} ${FRAME_H * chinFrac * 0.93}`}
              fill="none"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
          </svg>
        )}
      </div>

      {/* Zoom slider */}
      <div className="flex flex-col items-center gap-2 w-full max-w-xs">
        <div className="flex items-center gap-3 w-full">
          <button
            onClick={() => setImgScale(s => clampScale(s - 0.05))}
            className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <input
            type="range"
            min={5}
            max={500}
            step={0.1}
            value={imgScale * 100}
            onChange={(e) => {
              setShowSilhouette(false)
              setImgScale(parseFloat(e.target.value) / 100)
            }}
            className="flex-1 accent-blue-500"
          />
          <button
            onClick={() => setImgScale(s => clampScale(s + 0.05))}
            className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 w-16 text-right">{t('fineTune', lang)}</span>
          <button
            onClick={() => setImgScale(s => clampScale(parseFloat((s - 0.01).toFixed(3))))}
            className="px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-mono transition-colors"
          >－1%</button>
          <span className="text-xs text-gray-400 w-12 text-center font-mono">
            {Math.round(imgScale * 100)}%
          </span>
          <button
            onClick={() => setImgScale(s => clampScale(parseFloat((s + 0.01).toFixed(3))))}
            className="px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-mono transition-colors"
          >＋1%</button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium transition-colors"
        >
          {t('reupload', lang)}
        </button>
        <button
          onClick={handleReset}
          className="px-3 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={generate}
          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
        >
          {t('generate', lang)}
        </button>
      </div>
    </div>
  )
}
