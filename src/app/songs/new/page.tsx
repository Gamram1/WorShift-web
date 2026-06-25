import Link from 'next/link'
import { SongForm } from '@/components/SongForm'
import { createSong } from '../actions'

export default function NewSongPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/songs" className="text-ws-mid hover:text-ws-text text-sm transition-colors">
          ← 뒤로
        </Link>
        <h1 className="text-xl font-bold text-ws-text">새 곡 등록</h1>
      </div>
      <SongForm action={createSong} />
    </div>
  )
}
