import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

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

function isImage(url: string) {
  return /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url)
}

export default async function SongDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const song = await prisma.song.findUnique({ where: { id: Number(id) } })
  if (!song) notFound()

  const gs = GENRE_STYLE[song.genre] ?? 'bg-ws-border-light text-ws-mid'

  return (
    <div>
      {/* 상단 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/songs" className="text-ws-mid hover:text-ws-text text-sm transition-colors">
            ← 뒤로
          </Link>
        </div>
        <Link
          href={`/songs/${song.id}/edit`}
          className="px-4 py-2 rounded-xl bg-ws-primary text-white text-sm font-bold hover:opacity-90 transition-opacity"
        >
          편집
        </Link>
      </div>

      {/* 제목 + 장르 */}
      <div className="bg-white border border-ws-border rounded-2xl p-5 mb-4">
        <div className="flex items-start gap-4">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${gs}`}>
            <span className="text-2xl font-bold">{song.title[0]}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-ws-text">{song.title}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${gs}`}>{song.genre}</span>
              {song.key && (
                <span className="text-sm font-bold text-ws-mid">{song.key}</span>
              )}
              {song.timeSignature && (
                <span className="text-xs text-ws-light border border-ws-border px-2 py-0.5 rounded-full">{song.timeSignature}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 예배 유형 */}
      {song.worshipTypes.length > 0 && (
        <div className="bg-white border border-ws-border rounded-2xl p-4 mb-4">
          <p className="text-xs font-bold text-ws-light tracking-widest uppercase mb-2.5">예배 유형</p>
          <div className="flex flex-wrap gap-2">
            {song.worshipTypes.map((wt) => (
              <span
                key={wt}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg ${WORSHIP_STYLE[wt] ?? 'bg-ws-border-light text-ws-mid'}`}
              >
                {wt}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 메모 */}
      {song.memo && (
        <div className="bg-white border border-ws-border rounded-2xl p-4 mb-4">
          <p className="text-xs font-bold text-ws-light tracking-widest uppercase mb-2">메모</p>
          <p className="text-sm text-ws-text whitespace-pre-wrap">{song.memo}</p>
        </div>
      )}

      {/* 악보 */}
      {song.pdfPath && (
        <div className="bg-white border border-ws-border rounded-2xl p-4 mb-4">
          <p className="text-xs font-bold text-ws-light tracking-widest uppercase mb-3">악보</p>
          {isImage(song.pdfPath) ? (
            <a href={song.pdfPath} target="_blank" rel="noopener noreferrer">
              <img
                src={song.pdfPath}
                alt="악보"
                className="w-full rounded-xl border border-ws-border object-contain max-h-96 hover:opacity-90 transition-opacity"
              />
              <p className="text-xs text-ws-light text-center mt-2">이미지를 클릭하면 원본으로 열려요</p>
            </a>
          ) : (
            <a
              href={song.pdfPath}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-ws-bg rounded-xl border border-ws-border hover:border-ws-primary transition-colors"
            >
              <span className="text-3xl">📄</span>
              <div>
                <p className="text-sm font-bold text-ws-text">악보 PDF</p>
                <p className="text-xs text-ws-primary">새 탭에서 열기 →</p>
              </div>
            </a>
          )}
        </div>
      )}
    </div>
  )
}
