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
        <h1 className="text-2xl font-semibold text-white text-center mb-6">
          {t('appTitle', lang)}
        </h1>

        {/* Format selector */}
        <div className="mb-5">
          <label className="block text-xs text-gray-400 mb-2">{t('selectFormat', lang)}</label>
          <select
            value={format.id}
            onChange={(e) => {
              const found = FORMATS.find(f => f.id === e.target.value)
              if (found) onFormatChange(found)
            }}
            className="w-full bg-gray-800 border border-gray-600 text-white text-sm rounded-xl px-3 py-2.5 appearance-none cursor-pointer focus:outline-none focus:border-blue-500"
          >
            {FORMATS.map(f => (
              <option key={f.id} value={f.id}>
                {f.flag} {f.country[lang]} — {f.label[lang]} ({f.width}×{f.height}mm)
              </option>
            ))}
          </select>
        </div>

        {/* Upload area */}
        <div
          className={`
            border-2 border-dashed rounded-2xl p-12
            flex flex-col items-center justify-center gap-4
            cursor-pointer transition-colors duration-200
            ${dragging
              ? 'border-blue-400 bg-blue-950/30'
              : 'border-gray-600 hover:border-gray-400 bg-gray-900/40'
            }
          `}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center">
            <Upload className="w-7 h-7 text-gray-300" />
          </div>
          <div className="text-center">
            <p className="text-white font-medium">{t('upload', lang)}</p>
            <p className="text-gray-500 text-sm mt-1">{t('uploadHint', lang)}</p>
            <p className="text-gray-600 text-xs mt-1">{t('uploadFormats', lang)}</p>
          </div>
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-400 text-center">{error}</p>
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
