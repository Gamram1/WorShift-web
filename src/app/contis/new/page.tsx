import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ContiForm } from '@/components/ContiForm'
import { createConti } from '../actions'

export default async function NewContiPage() {
  const allSongs = await prisma.song.findMany({
    select: { id: true, title: true, genre: true, key: true },
    orderBy: { lastUsedAt: 'desc' },
  })

  const today = new Date().toISOString().split('T')[0]

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/contis" className="text-ws-mid hover:text-ws-text text-sm transition-colors">
          ← 뒤로
        </Link>
        <h1 className="text-xl font-bold text-ws-text">새 콘티</h1>
      </div>
      <ContiForm action={createConti} defaultDate={today} allSongs={allSongs} />
    </div>
  )
}
