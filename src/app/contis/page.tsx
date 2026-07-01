import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/format'

const WORSHIP_STYLE: Record<string, string> = {
  '주일예배': 'bg-sunday-bg text-sunday-text',
  '수요예배': 'bg-wednesday-bg text-wednesday-text',
  '금요예배': 'bg-friday-bg text-friday-text',
  '새벽예배': 'bg-dawn-bg text-dawn-text',
  '특별예배': 'bg-special-bg text-special-text',
}

export default async function ContisPage() {
  const contis = await prisma.conti.findMany({
    include: {
      songs: {
        include: { song: { select: { title: true, key: true } } },
        orderBy: { orderIndex: 'asc' },
      },
    },
    orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-ws-text">콘티</h1>
          <p className="text-ws-light text-sm mt-0.5">{contis.length}개</p>
        </div>
        <Link
          href="/contis/new"
          className="bg-ws-primary text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
        >
          + 새 콘티
        </Link>
      </div>

      {contis.length === 0 ? (
        <p className="text-center py-16 text-ws-light text-sm">
          아직 등록된 콘티가 없어요. 새 콘티를 만들어보세요!
        </p>
      ) : (
        <ul className="space-y-3">
          {contis.map((conti) => {
            const ws = WORSHIP_STYLE[conti.worshipType] ?? 'bg-ws-border-light text-ws-mid'
            return (
              <li
                key={conti.id}
                className="bg-white border border-ws-border rounded-2xl p-4 hover:border-ws-primary transition-colors"
              >
                <Link href={`/contis/${conti.id}`} className="block">
                  <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-lg mb-2 ${ws}`}>
                    {conti.worshipType}
                  </span>
                  <p className="font-bold text-ws-text text-base">{formatDate(conti.date)}</p>
                  <p className="text-ws-light text-xs mt-1 mb-2">{conti.songs.length}곡</p>
                  {conti.songs.length > 0 && (
                    <ol className="space-y-0.5">
                      {conti.songs.map((cs, idx) => (
                        <li key={cs.id} className="flex items-center gap-1.5 text-xs text-ws-mid">
                          <span className="text-ws-light w-3 shrink-0">{idx + 1}.</span>
                          <span>{cs.song.title}</span>
                          {cs.song.key && <span className="text-ws-light">{cs.song.key}</span>}
                        </li>
                      ))}
                    </ol>
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
