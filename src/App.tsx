import { useState } from 'react'
import PhotoUpload from './components/PhotoUpload'
import PhotoEditor from './components/PhotoEditor'
import PrintPreview from './components/PrintPreview'
import { type Lang, t } from './i18n'
import { type PhotoFormat, DEFAULT_FORMAT } from './photoFormats'

type Step = 1 | 2 | 3

export default function App() {
  const [step, setStep] = useState<Step>(1)
  const [imageSrc, setImageSrc] = useState<string>('')
  const [photoCrop, setPhotoCrop] = useState<string>('')
  const [lang, setLang] = useState<Lang>('zh')
  const [format, setFormat] = useState<PhotoFormat>(DEFAULT_FORMAT)

  const STEPS = [
    { num: 1, label: t('step1', lang) },
    { num: 2, label: t('step2', lang) },
    { num: 3, label: t('step3', lang) },
  ]

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* Language toggle — always visible */}
      <button
        onClick={() => setLang(l => l === 'zh' ? 'en' : 'zh')}
        className="fixed top-3 right-4 z-50 px-3 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium"
      >
        {lang === 'zh' ? 'EN' : '中文'}
      </button>

      {/* Step indicator — only show on step 2/3 */}
      {step > 1 && (
        <div className="fixed top-0 left-0 right-0 z-40 flex justify-center pt-4 pb-3 bg-[#0f0f0f]/80 backdrop-blur-sm border-b border-white/5">
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
            lang={lang}
            format={format}
            onFormatChange={setFormat}
            onUpload={(src) => {
              setImageSrc(src)
              setStep(2)
            }}
          />
        )}

        {step === 2 && (
          <PhotoEditor
            imageSrc={imageSrc}
            lang={lang}
            format={format}
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
            lang={lang}
            format={format}
            onBack={() => setStep(2)}
          />
        )}
      </div>
    </div>
  )
}
