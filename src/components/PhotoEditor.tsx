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

  const ghostBtnStyle: React.CSSProperties = {
    minHeight: 44,
    padding: '0 18px',
    borderRadius: 12,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.18s ease',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  }

  const iconBtnStyle: React.CSSProperties = {
    minHeight: 44,
    minWidth: 44,
    borderRadius: 12,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#64748B',
    cursor: 'pointer',
    transition: 'all 0.18s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  const primaryBtnStyle: React.CSSProperties = {
    minHeight: 44,
    padding: '0 28px',
    borderRadius: 12,
    background: '#3B82F6',
    border: 'none',
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 0 20px rgba(59,130,246,0.35)',
    transition: 'all 0.18s ease',
  }

  const zoomBtnStyle: React.CSSProperties = {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#64748B',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease',
    flexShrink: 0,
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8 gap-5">

      {/* Format badge + heading */}
      <div className="text-center">
        {/* Format chip */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '3px 10px',
            borderRadius: 20,
            background: 'rgba(59,130,246,0.1)',
            border: '1px solid rgba(59,130,246,0.2)',
            fontSize: 11,
            color: '#60A5FA',
            marginBottom: 8,
          }}
        >
          <span>{format.flag}</span>
          <span>{format.country[lang]}</span>
          <span style={{ color: '#3B82F6' }}>·</span>
          <span>{format.label[lang]}</span>
          <span style={{ color: '#3B82F6' }}>·</span>
          <span>{format.width}×{format.height}mm</span>
        </div>
        <h2 style={{ color: '#F1F5F9', fontSize: 18, fontWeight: 600, margin: 0 }}>
          {t('adjustCrop', lang)}
        </h2>
        <p style={{ color: '#475569', fontSize: 13, marginTop: 4 }}>
          {t('adjustHint', lang)}
        </p>
      </div>

      {/* Editor viewport */}
      <div
        style={{
          position: 'relative',
          borderRadius: 16,
          overflow: 'hidden',
          background: '#0D1117',
          userSelect: 'none',
          cursor: dragging ? 'grabbing' : 'grab',
          width: VIEWPORT_W,
          height: VIEWPORT_H,
          boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 20px 60px rgba(0,0,0,0.6)',
        }}
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
            borderTop: '1px dashed rgba(251,191,36,0.6)',
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
            borderTop: '1px dashed rgba(251,191,36,0.6)',
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
            borderLeft: '1px dashed rgba(96,165,250,0.45)',
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
            borderLeft: '1px dashed rgba(96,165,250,0.45)',
            pointerEvents: 'none',
            zIndex: 12,
          }}
        />

        {/* Guide labels */}
        <div style={{ position: 'absolute', left: FRAME_X + FRAME_W + 6, top: FRAME_Y + FRAME_H * crownFrac - 8, fontSize: 10, color: 'rgba(251,191,36,0.8)', pointerEvents: 'none', zIndex: 12, whiteSpace: 'nowrap' }}>
          {t('crownLine', lang)}
        </div>
        <div style={{ position: 'absolute', left: FRAME_X + FRAME_W + 6, top: FRAME_Y + FRAME_H * chinFrac - 8, fontSize: 10, color: 'rgba(251,191,36,0.8)', pointerEvents: 'none', zIndex: 12, whiteSpace: 'nowrap' }}>
          {t('chinLine', lang)}
        </div>
        <div style={{ position: 'absolute', left: FRAME_X + FRAME_W * headWidthInsetFrac + 2, top: FRAME_Y + 4, fontSize: 9, color: 'rgba(96,165,250,0.7)', pointerEvents: 'none', zIndex: 12, whiteSpace: 'nowrap' }}>
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
              fill="rgba(255,255,255,0.06)"
              stroke="rgba(255,255,255,0.22)"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
            {/* Neck + shoulders hint */}
            <path
              d={`M ${FRAME_W * 0.35} ${FRAME_H * chinFrac * 0.93} Q ${FRAME_W * 0.5} ${FRAME_H * chinFrac} ${FRAME_W * 0.65} ${FRAME_H * chinFrac * 0.93}`}
              fill="none"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
          </svg>
        )}
      </div>

      {/* Zoom slider */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, width: '100%', maxWidth: 340 }}>
        {/* Slider row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
          <button
            onClick={() => setImgScale(s => clampScale(s - 0.05))}
            style={zoomBtnStyle}
          >
            <ZoomOut style={{ width: 15, height: 15 }} />
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
            style={{ flex: 1, accentColor: '#3B82F6' }}
          />
          <button
            onClick={() => setImgScale(s => clampScale(s + 0.05))}
            style={zoomBtnStyle}
          >
            <ZoomIn style={{ width: 15, height: 15 }} />
          </button>
        </div>

        {/* Fine-tune row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: '#475569', width: 28, textAlign: 'right' }}>
            {t('fineTune', lang)}
          </span>
          <button
            onClick={() => setImgScale(s => clampScale(parseFloat((s - 0.01).toFixed(3))))}
            style={{
              padding: '5px 12px',
              borderRadius: 20,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#94A3B8',
              fontSize: 12,
              fontFamily: 'monospace',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >－1%</button>
          <span style={{ fontSize: 12, color: '#64748B', width: 44, textAlign: 'center', fontFamily: 'monospace' }}>
            {Math.round(imgScale * 100)}%
          </span>
          <button
            onClick={() => setImgScale(s => clampScale(parseFloat((s + 0.01).toFixed(3))))}
            style={{
              padding: '5px 12px',
              borderRadius: 20,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#94A3B8',
              fontSize: 12,
              fontFamily: 'monospace',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >＋1%</button>
        </div>
      </div>

      {/* Actions */}
      <div
        style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 340 }}
      >
        <button style={ghostBtnStyle} onClick={onBack}>
          {t('reupload', lang)}
        </button>
        <button style={iconBtnStyle} onClick={handleReset} title={t('reset', lang)}>
          <RotateCcw style={{ width: 15, height: 15 }} />
        </button>
        <button
          style={{ ...primaryBtnStyle, flex: 1 }}
          onClick={generate}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.02)'
            ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 28px rgba(59,130,246,0.55)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
            ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 20px rgba(59,130,246,0.35)'
          }}
          onMouseDown={e => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.98)'
          }}
          onMouseUp={e => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.02)'
          }}
        >
          {t('generate', lang)}
        </button>
      </div>
    </div>
  )
}
