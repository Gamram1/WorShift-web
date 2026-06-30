'use client'

import { useActionState, useState } from 'react'

type ActionState = { error: string } | null

type SongData = {
  title: string
  genre: string
  key: string | null
  timeSignature: string | null
  worshipTypes: string[]
  memo: string | null
  pdfPath: string | null
}

const GENRES = ['CCM', '찬송가', '기타']
const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'Bb', 'B']
const TIME_SIGS = ['4/4', '3/4', '2/4', '6/8']
const WORSHIP_TYPES = ['주일예배', '새벽예배', '금요예배', '특별예배']

const PILL =
  'block px-3 py-1.5 rounded-lg border border-ws-border text-sm text-ws-mid cursor-pointer select-none ' +
  'peer-checked:bg-ws-primary-light peer-checked:text-ws-primary peer-checked:border-ws-primary transition-all'

function isImage(url: string) {
  return /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url)
}

export function SongForm({
  action,
  song,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>
  song?: SongData
}) {
  const [state, formAction, pending] = useActionState(action, null)
  const [fileName, setFileName] = useState<string | null>(null)

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <p className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
          {state.error}
        </p>
      )}

      {/* 기존 악보 URL 전달 (수정 시 삭제/교체용) */}
      {song?.pdfPath && (
        <input type="hidden" name="existingSheetUrl" value={song.pdfPath} />
      )}

      {/* 제목 */}
      <div>
        <label className="block text-sm font-bold text-ws-text mb-2">제목 *</label>
        <input
          name="title"
          defaultValue={song?.title ?? ''}
          required
          placeholder="곡 제목을 입력하세요"
          className="w-full bg-white border border-ws-border rounded-xl px-4 py-3 text-sm text-ws-text placeholder:text-ws-light outline-none focus:border-ws-primary transition-colors"
        />
      </div>

      {/* 장르 */}
      <div>
        <label className="block text-sm font-bold text-ws-text mb-2">장르 *</label>
        <div className="flex gap-2">
          {GENRES.map((g) => (
            <label key={g} className="flex-1">
              <input
                type="radio"
                name="genre"
                value={g}
                defaultChecked={song ? song.genre === g : g === 'CCM'}
                required
                className="sr-only peer"
              />
              <span className="block text-center py-2.5 rounded-xl border border-ws-border text-sm text-ws-mid cursor-pointer select-none peer-checked:bg-ws-primary peer-checked:text-white peer-checked:border-ws-primary transition-all">
                {g}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* 키 */}
      <div>
        <label className="block text-sm font-bold text-ws-text mb-2">
          키 <span className="text-ws-light font-normal">(선택)</span>
        </label>
        <div className="flex flex-wrap gap-1.5">
          <label>
            <input type="radio" name="key" value="" defaultChecked={!song?.key} className="sr-only peer" />
            <span className={PILL}>없음</span>
          </label>
          {KEYS.map((k) => (
            <label key={k}>
              <input type="radio" name="key" value={k} defaultChecked={song?.key === k} className="sr-only peer" />
              <span className={PILL}>{k}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 박자 */}
      <div>
        <label className="block text-sm font-bold text-ws-text mb-2">
          박자 <span className="text-ws-light font-normal">(선택)</span>
        </label>
        <div className="flex flex-wrap gap-1.5">
          <label>
            <input type="radio" name="timeSignature" value="" defaultChecked={!song?.timeSignature} className="sr-only peer" />
            <span className={PILL}>없음</span>
          </label>
          {TIME_SIGS.map((t) => (
            <label key={t}>
              <input type="radio" name="timeSignature" value={t} defaultChecked={song?.timeSignature === t} className="sr-only peer" />
              <span className={PILL}>{t}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 예배 유형 */}
      <div>
        <label className="block text-sm font-bold text-ws-text mb-2">
          예배 유형 <span className="text-ws-light font-normal">(선택)</span>
        </label>
        <div className="flex flex-wrap gap-1.5">
          {WORSHIP_TYPES.map((wt) => (
            <label key={wt}>
              <input
                type="checkbox"
                name="worshipTypes"
                value={wt}
                defaultChecked={song?.worshipTypes.includes(wt)}
                className="sr-only peer"
              />
              <span className={PILL}>{wt}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 악보 파일 */}
      <div>
        <label className="block text-sm font-bold text-ws-text mb-2">
          악보 <span className="text-ws-light font-normal">(선택 · 이미지 또는 PDF)</span>
        </label>

        {/* 현재 악보 미리보기 */}
        {song?.pdfPath && !fileName && (
          <div className="mb-2 p-3 bg-ws-bg border border-ws-border rounded-xl flex items-center gap-3">
            {isImage(song.pdfPath) ? (
              <img src={song.pdfPath} alt="현재 악보" className="h-16 w-16 object-cover rounded-lg shrink-0" />
            ) : (
              <div className="h-16 w-16 bg-ws-border-light rounded-lg flex items-center justify-center shrink-0 text-2xl">📄</div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-ws-mid truncate">현재 악보 등록됨</p>
              <a
                href={song.pdfPath}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-ws-primary hover:underline"
              >
                열어보기 →
              </a>
            </div>
          </div>
        )}

        <label className="flex items-center gap-3 w-full bg-white border border-dashed border-ws-border rounded-xl px-4 py-3 cursor-pointer hover:border-ws-primary transition-colors">
          <span className="text-xl">📎</span>
          <span className="text-sm text-ws-mid flex-1 truncate">
            {fileName ?? (song?.pdfPath ? '새 파일로 교체하려면 클릭' : '파일을 선택하세요')}
          </span>
          <input
            type="file"
            name="sheet"
            accept="image/*,.pdf"
            className="sr-only"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
          />
        </label>
      </div>

      {/* 메모 */}
      <div>
        <label className="block text-sm font-bold text-ws-text mb-2">
          메모 <span className="text-ws-light font-normal">(선택)</span>
        </label>
        <textarea
          name="memo"
          defaultValue={song?.memo ?? ''}
          rows={3}
          placeholder="자유롭게 메모를 남기세요"
          className="w-full bg-white border border-ws-border rounded-xl px-4 py-3 text-sm text-ws-text placeholder:text-ws-light outline-none focus:border-ws-primary transition-colors resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full py-3.5 rounded-xl bg-ws-primary text-white text-sm font-bold disabled:opacity-60 hover:opacity-90 transition-opacity"
      >
        {pending ? '저장 중...' : '저장'}
      </button>
    </form>
  )
}
