'use client'

import { useActionState, useState } from 'react'

type ActionState = { error: string } | null

type SongItem = {
  songId: number
  title: string
  genre: string
  key: string | null
  memo: string
}

type AvailableSong = {
  id: number
  title: string
  genre: string
  key: string | null
}

const WORSHIP_TYPES = ['주일예배', '새벽예배', '금요예배', '특별예배']
const GENRES = ['전체', 'CCM', '찬송가', '기타']

const PILL =
  'block text-center py-2.5 rounded-xl border border-ws-border text-sm text-ws-mid cursor-pointer select-none ' +
  'peer-checked:bg-ws-primary peer-checked:text-white peer-checked:border-ws-primary transition-all'

export function ContiForm({
  action,
  defaultDate,
  defaultWorshipType,
  initialSongs = [],
  allSongs,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>
  defaultDate: string
  defaultWorshipType?: string
  initialSongs?: SongItem[]
  allSongs: AvailableSong[]
}) {
  const [state, formAction, pending] = useActionState(action, null)
  const [songs, setSongs] = useState<SongItem[]>(initialSongs)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerQ, setPickerQ] = useState('')
  const [pickerGenre, setPickerGenre] = useState('전체')

  const addSong = (song: AvailableSong) => {
    if (songs.some((s) => s.songId === song.id)) return
    setSongs((prev) => [...prev, { songId: song.id, title: song.title, genre: song.genre, key: song.key, memo: '' }])
  }

  const removeSong = (idx: number) => setSongs((prev) => prev.filter((_, i) => i !== idx))

  const moveSong = (idx: number, dir: -1 | 1) => {
    const next = idx + dir
    if (next < 0 || next >= songs.length) return
    setSongs((prev) => {
      const arr = [...prev]
      ;[arr[idx], arr[next]] = [arr[next], arr[idx]]
      return arr
    })
  }

  const updateMemo = (idx: number, memo: string) =>
    setSongs((prev) => prev.map((s, i) => (i === idx ? { ...s, memo } : s)))

  const closePicker = () => { setPickerOpen(false); setPickerQ(''); setPickerGenre('전체') }

  const filteredSongs = allSongs.filter((s) => {
    if (pickerQ && !s.title.includes(pickerQ)) return false
    if (pickerGenre !== '전체' && s.genre !== pickerGenre) return false
    return true
  })

  return (
    <>
      <form action={formAction} className="space-y-6">
        {state?.error && (
          <p className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
            {state.error}
          </p>
        )}

        <input
          type="hidden"
          name="songs"
          value={JSON.stringify(songs.map((s) => ({ songId: s.songId, memo: s.memo })))}
        />

        {/* 날짜 */}
        <div>
          <label className="block text-sm font-bold text-ws-text mb-2">날짜 *</label>
          <input
            type="date"
            name="date"
            defaultValue={defaultDate}
            required
            className="w-full bg-white border border-ws-border rounded-xl px-4 py-3 text-sm text-ws-text outline-none focus:border-ws-primary transition-colors"
          />
        </div>

        {/* 예배 유형 */}
        <div>
          <label className="block text-sm font-bold text-ws-text mb-2">예배 유형 *</label>
          <div className="grid grid-cols-2 gap-2">
            {WORSHIP_TYPES.map((wt) => (
              <label key={wt}>
                <input
                  type="radio"
                  name="worshipType"
                  value={wt}
                  defaultChecked={defaultWorshipType ? defaultWorshipType === wt : wt === '주일예배'}
                  required
                  className="sr-only peer"
                />
                <span className={PILL}>{wt}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 곡 순서 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-ws-text">
              곡 순서{' '}
              <span className="text-ws-light font-normal text-xs">({songs.length}곡)</span>
            </span>
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="text-sm font-bold text-ws-primary hover:opacity-75 transition-opacity"
            >
              + 곡 추가
            </button>
          </div>

          {songs.length === 0 ? (
            <div className="bg-ws-bg border-2 border-dashed border-ws-border rounded-xl py-8 text-center text-ws-light text-sm">
              + 곡 추가 버튼으로 곡을 추가하세요
            </div>
          ) : (
            <ul className="space-y-2">
              {songs.map((s, idx) => (
                <li key={`${s.songId}-${idx}`} className="bg-white border border-ws-border rounded-xl overflow-hidden">
                  <div className="flex items-center gap-2 px-3 py-3">
                    <span className="text-ws-light text-xs w-5 text-center shrink-0 font-bold">{idx + 1}</span>
                    <div className="flex flex-col gap-0.5 shrink-0">
                      <button type="button" onClick={() => moveSong(idx, -1)} disabled={idx === 0}
                        className="text-ws-light hover:text-ws-primary disabled:opacity-20 text-xs leading-none">▲</button>
                      <button type="button" onClick={() => moveSong(idx, 1)} disabled={idx === songs.length - 1}
                        className="text-ws-light hover:text-ws-primary disabled:opacity-20 text-xs leading-none">▼</button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-ws-text text-sm">{s.title}</span>
                      <span className="text-xs text-ws-mid ml-2">{s.genre}</span>
                      {s.key && <span className="text-xs text-ws-light ml-1">{s.key}</span>}
                    </div>
                    <button type="button" onClick={() => removeSong(idx)}
                      className="shrink-0 text-ws-light hover:text-red-400 transition-colors text-sm px-1">✕</button>
                  </div>
                  <div className="border-t border-ws-border-light px-3 py-2 pl-11">
                    <input
                      type="text"
                      value={s.memo}
                      onChange={(e) => updateMemo(idx, e.target.value)}
                      placeholder="메모 (선택)"
                      className="w-full text-xs text-ws-mid bg-transparent outline-none placeholder:text-ws-light"
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full py-3.5 rounded-xl bg-ws-primary text-white text-sm font-bold disabled:opacity-60 hover:opacity-90 transition-opacity"
        >
          {pending ? '저장 중...' : '저장'}
        </button>
      </form>

      {/* 곡 선택 모달 (bottom sheet) */}
      {pickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end" onClick={closePicker}>
          <div
            className="bg-white rounded-t-3xl w-full max-w-2xl mx-auto flex flex-col"
            style={{ maxHeight: '80vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-ws-border shrink-0">
              <h2 className="font-bold text-ws-text">곡 선택</h2>
              <button onClick={closePicker} className="text-ws-mid hover:text-ws-text text-lg leading-none">✕</button>
            </div>

            {/* 검색 + 장르 필터 */}
            <div className="px-5 py-3 space-y-2 border-b border-ws-border shrink-0">
              <input
                type="text"
                value={pickerQ}
                onChange={(e) => setPickerQ(e.target.value)}
                placeholder="곡 제목 검색..."
                className="w-full bg-ws-bg border border-ws-border rounded-xl px-4 py-2 text-sm text-ws-text placeholder:text-ws-light outline-none focus:border-ws-primary transition-colors"
              />
              <div className="flex gap-2 overflow-x-auto pb-1">
                {GENRES.map((g) => (
                  <button key={g} type="button" onClick={() => setPickerGenre(g)}
                    className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      pickerGenre === g ? 'bg-ws-primary text-white' : 'bg-ws-bg border border-ws-border text-ws-mid hover:text-ws-text'
                    }`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* 곡 목록 */}
            <div className="overflow-y-auto flex-1 px-5 py-3 space-y-2">
              {filteredSongs.length === 0 ? (
                <p className="text-center text-ws-light text-sm py-8">검색 결과가 없어요.</p>
              ) : (
                filteredSongs.map((song) => {
                  const added = songs.some((s) => s.songId === song.id)
                  return (
                    <button
                      key={song.id}
                      type="button"
                      onClick={() => { if (!added) { addSong(song); } }}
                      disabled={added}
                      className={`w-full text-left flex items-center justify-between px-4 py-3 rounded-xl border transition-colors ${
                        added
                          ? 'border-ws-border bg-ws-bg opacity-50 cursor-default'
                          : 'border-ws-border bg-white hover:border-ws-primary hover:bg-ws-primary-light'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-ws-text text-sm block">{song.title}</span>
                        <span className="text-xs text-ws-mid">{song.genre}{song.key ? ` · ${song.key}` : ''}</span>
                      </div>
                      {added && <span className="text-ws-primary text-xs font-bold shrink-0">추가됨 ✓</span>}
                    </button>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
