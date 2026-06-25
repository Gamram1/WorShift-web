'use client'

import { useActionState } from 'react'

type ActionState = { error: string } | null

type SongData = {
  title: string
  genre: string
  key: string | null
  timeSignature: string | null
  worshipTypes: string[]
  memo: string | null
}

const GENRES = ['CCM', '찬송가', '기타']
const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'Bb', 'B']
const TIME_SIGS = ['4/4', '3/4', '2/4', '6/8']
const WORSHIP_TYPES = ['주일예배', '새벽예배', '금요예배', '특별예배']

const PILL =
  'block px-3 py-1.5 rounded-lg border border-ws-border text-sm text-ws-mid cursor-pointer select-none ' +
  'peer-checked:bg-ws-primary-light peer-checked:text-ws-primary peer-checked:border-ws-primary transition-all'

export function SongForm({
  action,
  song,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>
  song?: SongData
}) {
  const [state, formAction, pending] = useActionState(action, null)

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <p className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
          {state.error}
        </p>
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
