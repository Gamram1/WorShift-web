import Link from 'next/link'
import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { SongFilters } from '@/components/SongFilters'

const GENRE_STYLE: Record<string, string> = {
  CCM: 'bg-ccm-bg text-ccm-text',
  '찬송가': 'bg-hymn-bg text-hymn-text',
}

const WORSHIP_STYLE: Record<string, string> = {
  '주일예배': 'bg-sunday-bg text-sunday-text',
  '금요예배': 'bg-friday-bg text-friday-text',
  '새벽예배': 'bg-dawn-bg text-dawn-text',
  '특별예배': 'bg-special-bg text-special-text',
}

export default async function SongsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; genre?: string; key?: string }>
}) {
  const { q = '', genre = '', key = '' } = await searchParams

  const songs = await prisma.song.findMany({
    where: {
      ...(q ? { title: { contains: q, mode: 'insensitive' } } : {}),
      ...(genre && genre !== '전체' ? { genre } : {}),
      ...(key && key !== '전체' ? { key } : {}),
    },
    orderBy: { lastUsedAt: 'desc' },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-ws-text">내 찬양 DB</h1>
          <p className="text-ws-light text-sm mt-0.5">{songs.length}곡</p>
        </div>
        <Link
          href="/songs/new"
          className="bg-ws-primary text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
        >
          + 새 곡
        </Link>
      </div>

      <Suspense>
        <SongFilters />
      </Suspense>

      {songs.length === 0 ? (
        <p className="text-center py-16 text-ws-light text-sm">
          {q || genre ? '검색 결과가 없어요.' : '아직 등록된 곡이 없어요. 새 곡을 추가해보세요!'}
        </p>
      ) : (
        <ul className="space-y-3 mt-4">
          {songs.map((song) => {
            const gs = GENRE_STYLE[song.genre] ?? 'bg-ws-border-light text-ws-mid'
            return (
              <li key={song.id}>
                <Link
                  href={`/songs/${song.id}`}
                  className="bg-white border border-ws-border rounded-2xl p-4 flex items-start gap-3 hover:border-ws-primary transition-colors block"
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${gs}`}>
                    <span className="text-base font-bold">{song.title[0]}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-ws-text text-sm">{song.title}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${gs}`}>{song.genre}</span>
                      {song.key && <span className="text-xs text-ws-mid font-medium">{song.key}</span>}
                    </div>
                    {song.worshipTypes.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {song.worshipTypes.map((wt) => (
                          <span
                            key={wt}
                            className={`text-xs px-2 py-0.5 rounded-full ${WORSHIP_STYLE[wt] ?? 'bg-ws-border-light text-ws-mid'}`}
                          >
                            {wt}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {song.pdfPath && (
                    <span className="shrink-0 text-ws-primary text-xs px-2 py-1 rounded-lg bg-ws-primary-light font-medium">
                      악보 ▶
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
