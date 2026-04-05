import { useState } from 'react'
import PhotoUpload from './components/PhotoUpload'
import PhotoEditor from './components/PhotoEditor'
import PrintPreview from './components/PrintPreview'

type Step = 1 | 2 | 3

const STEPS = [
  { num: 1, label: '上传照片' },
  { num: 2, label: '调整裁剪' },
  { num: 3, label: '下载打印版' },
]

export default function App() {
  const [step, setStep] = useState<Step>(1)
  const [imageSrc, setImageSrc] = useState<string>('')
  const [photoCrop, setPhotoCrop] = useState<string>('')

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* Step indicator — only show on step 2/3 */}
      {step > 1 && (
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 pb-3 bg-[#0f0f0f]/80 backdrop-blur-sm border-b border-white/5">
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s.num} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div
                    className={`
                      w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold
                      ${step === s.num
                        ? 'bg-blue-600 text-white'
                        : step > s.num
                          ? 'bg-gray-600 text-gray-300'
                          : 'bg-gray-800 text-gray-500'
                      }
                    `}
                  >
                    {s.num}
                  </div>
                  <span
                    className={`text-xs ${
                      step === s.num ? 'text-white font-medium' : 'text-gray-500'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="w-8 h-px bg-gray-700" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content — add top padding when header is shown */}
      <div className={step > 1 ? 'pt-14' : ''}>
        {step === 1 && (
          <PhotoUpload
            onUpload={(src) => {
              setImageSrc(src)
              setStep(2)
            }}
          />
        )}

        {step === 2 && (
          <PhotoEditor
            imageSrc={imageSrc}
            onGenerate={(crop) => {
              setPhotoCrop(crop)
              setStep(3)
            }}
            onBack={() => {
              setImageSrc('')
              setStep(1)
            }}
          />
        )}

        {step === 3 && (
          <PrintPreview
            photoCrop={photoCrop}
            onBack={() => setStep(2)}
          />
        )}
      </div>
    </div>
  )
}
