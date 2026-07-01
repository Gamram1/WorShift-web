'use client'

import { useState } from 'react'
import { updateSongSheet } from '@/app/songs/actions'

const GENRE_STYLE: Record<string, string> = {
  CCM: 'bg-ccm-bg text-ccm-text',
  '찬송가': 'bg-hymn-bg text-hymn-text',
}

type SongData = {
  id: number
  title: string
  genre: string
  key: string | null
  pdfPath: string | null
}

export type ContiSongItem = {
  id: number
  memo: string | null
  song: SongData
}

function isImage(url: string) {
  return /\.(jpg|jpeg|png)(\?|$)/i.test(url)
}

export function ContiSongList({ initialSongs }: { initialSongs: ContiSongItem[] }) {
  const [songs, setSongs] = useState(initialSongs)
  const [selected, setSelected] = useState<SongData | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const openModal = (song: SongData) => {
    setSelected(song)
    setFile(null)
    setFileName(null)
    setError(null)
  }

  const closeModal = () => {
    setSelected(null)
    setFile(null)
    setFileName(null)
    setError(null)
  }

  const handleUpload = async () => {
    if (!file || !selected) return
    setPending(true)
    setError(null)
    const fd = new FormData()
    fd.append('sheet', file)
    const result = await updateSongSheet(selected.id, fd)
    if ('error' in result) {
      setError(result.error)
    } else {
      const newUrl = result.url
      setSongs((prev) =>
        prev.map((cs) =>
          cs.song.id === selected.id ? { ...cs, song: { ...cs.song, pdfPath: newUrl } } : cs
        )
      )
      setSelected((prev) => (prev ? { ...prev, pdfPath: newUrl } : null))
      setFile(null)
      setFileName(null)
    }
    setPending(false)
  }

  if (songs.length === 0) {
    return (
      <div className="bg-white border border-ws-border rounded-xl py-8 text-center text-ws-light text-sm">
        등록된 곡이 없습니다
      </div>
    )
  }

  return (
    <>
      <ul className="space-y-2">
        {songs.map((cs, idx) => {
          const gs = GENRE_STYLE[cs.song.genre] ?? 'bg-ws-border-light text-ws-mid'
          const hasSheet = !!cs.song.pdfPath && isImage(cs.song.pdfPath)
          return (
            <li key={cs.id} className="bg-white border border-ws-border rounded-xl overflow-hidden hover:border-ws-primary transition-colors">
              <button
                type="button"
                onClick={() => openModal(cs.song)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
              >
                <div className="w-7 h-7 rounded-full bg-ws-border-light flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-ws-mid">{idx + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-ws-text text-sm">{cs.song.title}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${gs}`}>{cs.song.genre}</span>
                    {cs.song.key && <span className="text-xs text-ws-mid">{cs.song.key}</span>}
                  </div>
                </div>
                {hasSheet ? (
                  <span className="text-xs text-ws-primary font-bold shrink-0">악보 ✓</span>
                ) : (
                  <span className="text-xs text-ws-light shrink-0">악보 추가</span>
                )}
              </button>
              {cs.memo && (
                <div className="border-t border-ws-border-light px-4 py-2.5 pl-14 bg-ws-bg">
                  <p className="text-xs text-ws-mid">{cs.memo}</p>
                </div>
              )}
            </li>
          )
        })}
      </ul>

      {/* 악보 업로드 팝업 */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-sm flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-ws-border">
              <h2 className="font-bold text-ws-text">악보 업로드</h2>
              <button onClick={closeModal} className="text-ws-mid hover:text-ws-text text-lg leading-none">✕</button>
            </div>

            {/* 내용 */}
            <div className="px-5 py-4 space-y-4">
              <p className="text-sm font-bold text-ws-text">{selected.title}</p>

              {/* 현재 악보 미리보기 */}
              {selected.pdfPath && isImage(selected.pdfPath) && (
                <div className="rounded-xl overflow-hidden border border-ws-border bg-ws-bg">
                  <img
                    src={selected.pdfPath}
                    alt="현재 악보"
                    className="w-full object-contain max-h-52"
                  />
                </div>
              )}

              {/* 파일 선택 */}
              <label className="flex items-center gap-3 w-full bg-ws-bg border border-dashed border-ws-border rounded-xl px-4 py-3 cursor-pointer hover:border-ws-primary transition-colors">
                <span className="text-xl">📎</span>
                <span className="text-sm text-ws-mid flex-1 truncate">
                  {fileName ?? (selected.pdfPath ? '새 파일로 교체 (JPG, PNG)' : '파일을 선택하세요 (JPG, PNG)')}
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null
                    setFile(f)
                    setFileName(f?.name ?? null)
                    setError(null)
                  }}
                />
              </label>

              {error && (
                <p className="text-xs text-red-500 bg-red-50 border border-red-200 px-3 py-2 rounded-xl">
                  {error}
                </p>
              )}

              <button
                type="button"
                onClick={handleUpload}
                disabled={!file || pending}
                className="w-full py-3 rounded-xl bg-ws-primary text-white text-sm font-bold disabled:opacity-40 hover:opacity-90 transition-opacity"
              >
                {pending ? '업로드 중...' : '업로드'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
