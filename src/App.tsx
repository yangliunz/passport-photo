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
    <div className="min-h-screen" style={{ background: '#080B14' }}>
      {/* Language toggle */}
      <button
        onClick={() => setLang(l => l === 'zh' ? 'en' : 'zh')}
        className="fixed top-3 right-4 z-50 text-xs font-medium transition-all duration-200 hover:scale-105 active:scale-95"
        style={{
          padding: '5px 12px',
          borderRadius: '20px',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          color: '#94A3B8',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        {lang === 'zh' ? 'EN' : '中'}
      </button>

      {/* Step indicator — only show on step 2/3 */}
      {step > 1 && (
        <div
          className="fixed top-0 left-0 right-0 z-40 flex justify-center pt-4 pb-3"
          style={{
            background: 'rgba(8,11,20,0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s.num} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  {/* Pill */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '3px 10px 3px 6px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: 500,
                      transition: 'all 0.25s ease',
                      ...(step === s.num
                        ? {
                            background: '#3B82F6',
                            color: '#fff',
                            boxShadow: '0 0 12px rgba(59,130,246,0.45)',
                          }
                        : step > s.num
                        ? {
                            background: 'rgba(255,255,255,0.08)',
                            color: '#64748B',
                          }
                        : {
                            background: 'rgba(255,255,255,0.04)',
                            color: '#475569',
                          }),
                    }}
                  >
                    {step > s.num ? (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <span
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 9,
                          background: step === s.num ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.07)',
                        }}
                      >
                        {s.num}
                      </span>
                    )}
                    {s.label}
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ width: 16, height: 1, background: 'rgba(255,255,255,0.1)' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className={step > 1 ? 'pt-14' : ''}>
        {step === 1 && (
          <div className="animate-enter">
            <PhotoUpload
              lang={lang}
              format={format}
              onFormatChange={setFormat}
              onUpload={(src) => {
                setImageSrc(src)
                setStep(2)
              }}
            />
          </div>
        )}

        {step === 2 && (
          <div className="animate-enter">
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
          </div>
        )}

        {step === 3 && (
          <div className="animate-enter">
            <PrintPreview
              photoCrop={photoCrop}
              lang={lang}
              format={format}
              onBack={() => setStep(2)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
