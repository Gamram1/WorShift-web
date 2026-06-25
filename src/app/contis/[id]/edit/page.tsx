import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ContiForm } from '@/components/ContiForm'
import { updateConti } from '../../actions'

export default async function EditContiPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [conti, allSongs] = await Promise.all([
    prisma.conti.findUnique({
      where: { id: Number(id) },
      include: {
        songs: {
          include: { song: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
    }),
    prisma.song.findMany({
      select: { id: true, title: true, genre: true, key: true },
      orderBy: { lastUsedAt: 'desc' },
    }),
  ])

  if (!conti) notFound()

  const initialSongs = conti.songs.map((cs) => ({
    songId: cs.songId,
    title: cs.song.title,
    genre: cs.song.genre,
    key: cs.song.key,
    memo: cs.memo ?? '',
  }))

  const updateAction = updateConti.bind(null, conti.id)

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/contis/${conti.id}`} className="text-ws-mid hover:text-ws-text text-sm transition-colors">
          ← 뒤로
        </Link>
        <h1 className="text-xl font-bold text-ws-text">콘티 수정</h1>
      </div>
      <ContiForm
        action={updateAction}
        defaultDate={conti.date}
        defaultWorshipType={conti.worshipType}
        initialSongs={initialSongs}
        allSongs={allSongs}
      />
    </div>
  )
}
