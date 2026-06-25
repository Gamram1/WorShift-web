'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition, useRef } from 'react'

const GENRES = ['전체', 'CCM', '찬송가', '기타']

export function SongFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  const urlQ = searchParams.get('q') ?? ''
  const urlGenre = searchParams.get('genre') ?? '전체'

  const navigate = (updates: { q?: string; genre?: string }) => {
    const sp = new URLSearchParams(searchParams.toString())
    if ('q' in updates) {
      if (updates.q) sp.set('q', updates.q)
      else sp.delete('q')
    }
    if ('genre' in updates) {
      if (updates.genre && updates.genre !== '전체') sp.set('genre', updates.genre)
      else sp.delete('genre')
    }
    startTransition(() => router.replace(`/songs?${sp.toString()}`))
  }

  return (
    <div className="space-y-3">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          navigate({ q: inputRef.current?.value ?? '' })
        }}
        className="flex gap-2"
      >
        <input
          ref={inputRef}
          key={urlQ}
          defaultValue={urlQ}
          placeholder="곡 제목 검색..."
          className="flex-1 bg-white border border-ws-border rounded-xl px-4 py-2.5 text-sm text-ws-text placeholder:text-ws-light outline-none focus:border-ws-primary transition-colors"
        />
        <button
          type="submit"
          disabled={isPending}
          className="shrink-0 bg-white border border-ws-border rounded-xl px-4 py-2.5 text-sm text-ws-mid hover:text-ws-primary hover:border-ws-primary disabled:opacity-50 transition-colors"
        >
          검색
        </button>
      </form>

      <div className="flex gap-2 flex-wrap">
        {GENRES.map((g) => (
          <button
            key={g}
            onClick={() => navigate({ genre: g })}
            disabled={isPending}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors disabled:opacity-50 ${
              urlGenre === g
                ? 'bg-ws-primary text-white'
                : 'bg-white border border-ws-border text-ws-mid hover:text-ws-text'
            }`}
          >
            {g}
          </button>
        ))}
      </div>
    </div>
  )
}
