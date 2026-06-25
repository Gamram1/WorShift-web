import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { SongForm } from '@/components/SongForm'
import { DeleteSongButton } from '@/components/DeleteSongButton'
import { updateSong, deleteSong } from '../../actions'

export default async function EditSongPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const song = await prisma.song.findUnique({ where: { id: Number(id) } })
  if (!song) notFound()

  const updateAction = updateSong.bind(null, song.id)
  const deleteAction = deleteSong.bind(null, song.id)

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/songs" className="text-ws-mid hover:text-ws-text text-sm transition-colors">
          ← 뒤로
        </Link>
        <h1 className="text-xl font-bold text-ws-text">곡 수정</h1>
      </div>
      <SongForm action={updateAction} song={song} />
      <div className="mt-3">
        <DeleteSongButton action={deleteAction} />
      </div>
    </div>
  )
}
