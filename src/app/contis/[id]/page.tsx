import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/format'
import { DeleteContiButton } from '@/components/DeleteContiButton'
import { ContiSongList } from '@/components/ContiSongList'
import { deleteConti } from '../actions'

const WORSHIP_STYLE: Record<string, string> = {
  '주일예배': 'bg-sunday-bg text-sunday-text',
  '수요예배': 'bg-wednesday-bg text-wednesday-text',
  '금요예배': 'bg-friday-bg text-friday-text',
  '새벽예배': 'bg-dawn-bg text-dawn-text',
  '특별예배': 'bg-special-bg text-special-text',
}


export default async function ContiDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const conti = await prisma.conti.findUnique({
    where: { id: Number(id) },
    include: {
      songs: {
        include: { song: true },
        orderBy: { orderIndex: 'asc' },
      },
    },
  })
  if (!conti) notFound()

  const ws = WORSHIP_STYLE[conti.worshipType] ?? 'bg-ws-border-light text-ws-mid'
  const deleteAction = deleteConti.bind(null, conti.id)

  return (
    <div>
      {/* 상단 버튼 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/contis" className="text-ws-mid hover:text-ws-text text-sm transition-colors">
            ← 뒤로
          </Link>
          <h1 className="text-xl font-bold text-ws-text">콘티 상세</h1>
        </div>
        <Link
          href={`/contis/${conti.id}/edit`}
          className="px-4 py-2 rounded-xl bg-ws-primary text-white text-sm font-bold hover:opacity-90 transition-opacity"
        >
          수정
        </Link>
      </div>

      {/* 예배 정보 카드 */}
      <div className="bg-white border border-ws-border rounded-2xl p-5 mb-6">
        <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-lg mb-3 ${ws}`}>
          {conti.worshipType}
        </span>
        <p className="text-2xl font-bold text-ws-text">{formatDate(conti.date)}</p>
        <p className="text-ws-light text-sm mt-1">총 {conti.songs.length}곡</p>
      </div>

      {/* 곡 목록 */}
      <div>
        <p className="text-xs font-bold text-ws-light tracking-widest uppercase mb-3">곡 순서</p>
        <ContiSongList
          initialSongs={conti.songs.map((cs) => ({
            id: cs.id,
            memo: cs.memo,
            song: {
              id: cs.song.id,
              title: cs.song.title,
              genre: cs.song.genre,
              key: cs.song.key,
              pdfPath: cs.song.pdfPath,
            },
          }))}
        />
      </div>

      {/* 삭제 버튼 */}
      <div className="mt-8">
        <DeleteContiButton action={deleteAction} />
      </div>
    </div>
  )
}
