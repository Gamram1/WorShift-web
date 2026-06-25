'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

type ActionState = { error: string } | null

function nullIfEmpty(val: FormDataEntryValue | null): string | null {
  if (!val || typeof val !== 'string') return null
  const s = val.trim()
  return s === '' || s === '-' ? null : s
}

export async function createSong(_: ActionState, formData: FormData): Promise<ActionState> {
  const title = (formData.get('title') as string)?.trim()
  const genre = formData.get('genre') as string
  if (!title || !genre) return { error: '제목과 장르는 필수입니다.' }

  await prisma.song.create({
    data: {
      title,
      genre,
      key: nullIfEmpty(formData.get('key')),
      timeSignature: nullIfEmpty(formData.get('timeSignature')),
      memo: nullIfEmpty(formData.get('memo')),
      worshipTypes: formData.getAll('worshipTypes') as string[],
    },
  })

  revalidatePath('/songs')
  redirect('/songs')
}

export async function updateSong(id: number, _: ActionState, formData: FormData): Promise<ActionState> {
  const title = (formData.get('title') as string)?.trim()
  const genre = formData.get('genre') as string
  if (!title || !genre) return { error: '제목과 장르는 필수입니다.' }

  await prisma.song.update({
    where: { id },
    data: {
      title,
      genre,
      key: nullIfEmpty(formData.get('key')),
      timeSignature: nullIfEmpty(formData.get('timeSignature')),
      memo: nullIfEmpty(formData.get('memo')),
      worshipTypes: formData.getAll('worshipTypes') as string[],
    },
  })

  revalidatePath('/songs')
  redirect('/songs')
}

export async function deleteSong(id: number): Promise<void> {
  await prisma.song.delete({ where: { id } })
  revalidatePath('/songs')
  redirect('/songs')
}
