import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { type Lang, t } from '../i18n'
import { type PhotoFormat, FORMATS } from '../photoFormats'

interface Props {
  onUpload: (objectUrl: string) => void
  lang: Lang
  format: PhotoFormat
  onFormatChange: (f: PhotoFormat) => void
}

export default function PhotoUpload({ onUpload, lang, format, onFormatChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string>('')

  function handleFile(file: File) {
    setError('')
    const isImage = file.type.startsWith('image/') ||
      /\.(jpe?g|png|webp|gif|bmp|heic|avif)$/i.test(file.name)
    if (!isImage) {
      setError(t('uploadError', lang))
      return
    }
    try {
      const url = URL.createObjectURL(file)
      onUpload(url)
    } catch {
      setError(t('uploadError', lang))
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md">

        {/* Title */}
        <div className="text-center mb-8">
          <h1
            className="text-3xl font-bold mb-2"
            style={{
              background: 'linear-gradient(135deg, #F1F5F9 0%, #94A3B8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {t('appTitle', lang)}
          </h1>
          <p style={{ color: '#475569', fontSize: 13 }}>
            {lang === 'zh' ? '专业证件照，随时随地，一键生成' : 'Professional ID photos, anywhere, in seconds'}
          </p>
        </div>

        {/* Format selector — horizontal scrollable card row */}
        <div className="mb-6">
          <label style={{ display: 'block', fontSize: 11, color: '#475569', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>
            {t('selectFormat', lang)}
          </label>
          <div
            style={{
              display: 'flex',
              gap: 8,
              overflowX: 'auto',
              paddingBottom: 4,
              scrollbarWidth: 'none',
            }}
          >
            {FORMATS.map(f => {
              const selected = f.id === format.id
              return (
                <button
                  key={f.id}
                  onClick={() => onFormatChange(f)}
                  style={{
                    flexShrink: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                    padding: '8px 10px',
                    borderRadius: 12,
                    border: selected
                      ? '1.5px solid #3B82F6'
                      : '1.5px solid rgba(255,255,255,0.07)',
                    background: selected
                      ? 'rgba(59,130,246,0.12)'
                      : 'rgba(255,255,255,0.03)',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    boxShadow: selected ? '0 0 14px rgba(59,130,246,0.25)' : 'none',
                    minWidth: 64,
                  }}
                >
                  <span style={{ fontSize: 20, lineHeight: 1 }}>{f.flag}</span>
                  <span style={{ fontSize: 10, color: selected ? '#93C5FD' : '#64748B', fontWeight: 500, whiteSpace: 'nowrap' }}>
                    {f.country[lang]}
                  </span>
                  <span style={{ fontSize: 9, color: selected ? '#60A5FA' : '#475569', whiteSpace: 'nowrap' }}>
                    {f.width}×{f.height}mm
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Upload area */}
        <div
          className={`upload-zone-hover`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          style={{
            border: dragging
              ? '2px dashed #3B82F6'
              : '2px dashed rgba(255,255,255,0.1)',
            borderRadius: 20,
            padding: '40px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            background: dragging
              ? 'rgba(59,130,246,0.08)'
              : 'rgba(255,255,255,0.02)',
            boxShadow: dragging ? '0 0 30px rgba(59,130,246,0.15)' : 'none',
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(59,130,246,0.1)',
              border: '1px solid rgba(59,130,246,0.2)',
              boxShadow: '0 0 20px rgba(59,130,246,0.12)',
            }}
          >
            <Upload style={{ width: 26, height: 26, color: '#60A5FA' }} />
          </div>

          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#F1F5F9', fontWeight: 600, fontSize: 15, marginBottom: 4 }}>
              {t('upload', lang)}
            </p>
            <p style={{ color: '#475569', fontSize: 13, marginBottom: 2 }}>
              {t('uploadHint', lang)}
            </p>
            <p style={{ color: '#334155', fontSize: 11 }}>
              {t('uploadFormats', lang)}
            </p>
          </div>

          {/* CTA button */}
          <button
            onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}
            style={{
              minHeight: 44,
              width: '100%',
              maxWidth: 240,
              borderRadius: 12,
              background: '#3B82F6',
              color: '#fff',
              fontWeight: 600,
              fontSize: 14,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 0 20px rgba(59,130,246,0.35)',
              transition: 'all 0.18s ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.02)'
              ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 28px rgba(59,130,246,0.5)'
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
            {lang === 'zh' ? '选择照片' : 'Choose Photo'}
          </button>
        </div>

        {error && (
          <p style={{ marginTop: 12, fontSize: 13, color: '#F87171', textAlign: 'center' }}>{error}</p>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleChange}
        />
      </div>
    </div>
  )
}
