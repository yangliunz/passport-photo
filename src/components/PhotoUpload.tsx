import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'

interface Props {
  onUpload: (objectUrl: string) => void
}

export default function PhotoUpload({ onUpload }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string>('')

  function handleFile(file: File) {
    setError('')
    const isImage = file.type.startsWith('image/') ||
      /\.(jpe?g|png|webp|gif|bmp|heic|avif)$/i.test(file.name)
    if (!isImage) {
      setError('不支持的文件格式，请上传 JPG、PNG 或 WEBP')
      return
    }
    try {
      const url = URL.createObjectURL(file)
      onUpload(url)
    } catch {
      setError('文件读取失败，请重试')
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
        <h1 className="text-2xl font-semibold text-white text-center mb-2">证件照生成器</h1>
        <p className="text-sm text-gray-400 text-center mb-8">中国护照标准 · 33×48mm · 300dpi</p>

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
            <p className="text-white font-medium">上传照片</p>
            <p className="text-gray-500 text-sm mt-1">点击或拖拽图片到此处</p>
            <p className="text-gray-600 text-xs mt-1">支持 JPG、PNG、WEBP、HEIC</p>
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
