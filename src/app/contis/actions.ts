'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

type ActionState = { error: string } | null
type ContiSongInput = { songId: number; memo: string }

function parseSongs(formData: FormData): ContiSongInput[] {
  const raw = formData.get('songs') as string
  if (!raw) return []
  try { return JSON.parse(raw) } catch { return [] }
}

export async function createConti(_: ActionState, formData: FormData): Promise<ActionState> {
  const date = (formData.get('date') as string)?.trim()
  const worshipType = formData.get('worshipType') as string
  if (!date || !worshipType) return { error: '날짜와 예배 유형은 필수입니다.' }

  const songs = parseSongs(formData)
  const conti = await prisma.conti.create({ data: { date, worshipType } })

  if (songs.length > 0) {
    await prisma.contiSong.createMany({
      data: songs.map((s, i) => ({
        contiId: conti.id,
        songId: s.songId,
        orderIndex: i,
        memo: s.memo || null,
      })),
    })
  }

  revalidatePath('/contis')
  redirect(`/contis/${conti.id}`)
}

export async function updateConti(id: number, _: ActionState, formData: FormData): Promise<ActionState> {
  const date = (formData.get('date') as string)?.trim()
  const worshipType = formData.get('worshipType') as string
  if (!date || !worshipType) return { error: '날짜와 예배 유형은 필수입니다.' }

  const songs = parseSongs(formData)

  await prisma.contiSong.deleteMany({ where: { contiId: id } })
  await prisma.conti.update({ where: { id }, data: { date, worshipType } })

  if (songs.length > 0) {
    await prisma.contiSong.createMany({
      data: songs.map((s, i) => ({
        contiId: id,
        songId: s.songId,
        orderIndex: i,
        memo: s.memo || null,
      })),
    })
  }

  revalidatePath('/contis')
  revalidatePath(`/contis/${id}`)
  redirect(`/contis/${id}`)
}

export async function deleteConti(id: number): Promise<void> {
  await prisma.conti.delete({ where: { id } })
  revalidatePath('/contis')
  redirect('/contis')
}
