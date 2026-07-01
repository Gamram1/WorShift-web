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

const WORSHIP_TYPES = ['주일예배', '수요예배', '금요예배']
const GENRES = ['전체', 'CCM', '찬송가', '기타']

const PILL =
  'block text-center py-2 rounded-xl border border-ws-border text-sm text-ws-mid cursor-pointer select-none ' +
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
  const [pickerSelected, setPickerSelected] = useState<Set<number>>(new Set())

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

  const togglePickerSong = (song: AvailableSong) => {
    if (songs.some((s) => s.songId === song.id)) return
    setPickerSelected((prev) => {
      const next = new Set(prev)
      if (next.has(song.id)) next.delete(song.id)
      else next.add(song.id)
      return next
    })
  }

  const confirmPicker = () => {
    const toAdd = allSongs.filter(
      (s) => pickerSelected.has(s.id) && !songs.some((cs) => cs.songId === s.id)
    )
    setSongs((prev) => [
      ...prev,
      ...toAdd.map((s) => ({ songId: s.id, title: s.title, genre: s.genre, key: s.key, memo: '' })),
    ])
    closePicker()
  }

  const closePicker = () => {
    setPickerOpen(false)
    setPickerQ('')
    setPickerGenre('전체')
    setPickerSelected(new Set())
  }

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
          <div className="flex gap-2">
            {WORSHIP_TYPES.map((wt) => (
              <label key={wt} className="flex-1">
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
          <div className="flex items-center mb-2">
            <span className="text-sm font-bold text-ws-text">
              곡 순서{' '}
              <span className="text-ws-light font-normal text-xs">({songs.length}곡)</span>
            </span>
          </div>

          {songs.length > 0 && (
            <ul className="space-y-2 mb-2">
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

          {/* 곡 추가 클릭 영역 (항상 표시) */}
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="w-full py-5 border-2 border-dashed border-ws-border rounded-xl text-ws-light text-sm hover:border-ws-primary hover:text-ws-primary transition-colors"
          >
            + 곡 추가
          </button>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full py-3.5 rounded-xl bg-ws-primary text-white text-sm font-bold disabled:opacity-60 hover:opacity-90 transition-opacity"
        >
          {pending ? '저장 중...' : '저장'}
        </button>
      </form>

      {/* 곡 선택 모달 (center) */}
      {pickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4" onClick={closePicker}>
          <div
            className="bg-white rounded-3xl w-full max-w-lg flex flex-col"
            style={{ maxHeight: '55vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-ws-border shrink-0">
              <h2 className="font-bold text-ws-text">곡 선택</h2>
              <button onClick={closePicker} className="text-ws-mid hover:text-ws-text text-lg leading-none">✕</button>
            </div>

            {/* 검색 + 장르 필터 */}
            <div className="px-5 py-2 space-y-2 border-b border-ws-border shrink-0">
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
            <div className="overflow-y-auto flex-1 px-5 py-2 space-y-1.5">
              {filteredSongs.length === 0 ? (
                <p className="text-center text-ws-light text-sm py-6">검색 결과가 없어요.</p>
              ) : (
                filteredSongs.map((song) => {
                  const isInList = songs.some((s) => s.songId === song.id)
                  const isSelected = pickerSelected.has(song.id)
                  return (
                    <button
                      key={song.id}
                      type="button"
                      onClick={() => togglePickerSong(song)}
                      disabled={isInList}
                      className={`w-full text-left flex items-center justify-between px-4 py-2.5 rounded-xl border transition-colors ${
                        isInList
                          ? 'border-ws-border bg-ws-bg opacity-40 cursor-default'
                          : isSelected
                          ? 'border-ws-primary bg-ws-primary-light'
                          : 'border-ws-border bg-white hover:border-ws-primary hover:bg-ws-primary-light'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-ws-text text-sm block">{song.title}</span>
                        <span className="text-xs text-ws-mid">{song.genre}{song.key ? ` · ${song.key}` : ''}</span>
                      </div>
                      {isInList && <span className="text-ws-light text-xs shrink-0">추가됨</span>}
                      {!isInList && isSelected && <span className="text-ws-primary font-bold text-sm shrink-0">✓</span>}
                    </button>
                  )
                })
              )}
            </div>

            {/* 추가 확인 버튼 */}
            <div className="px-5 py-3 border-t border-ws-border shrink-0">
              <button
                type="button"
                onClick={confirmPicker}
                disabled={pickerSelected.size === 0}
                className="w-full py-3 rounded-xl bg-ws-primary text-white text-sm font-bold disabled:opacity-40 transition-opacity"
              >
                {pickerSelected.size > 0 ? `${pickerSelected.size}곡 추가하기` : '곡을 선택하세요'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
