'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { put, del } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

type ActionState = { error: string } | null

function nullIfEmpty(val: FormDataEntryValue | null): string | null {
  if (!val || typeof val !== 'string') return null
  const s = val.trim()
  return s === '' || s === '-' ? null : s
}

async function uploadSheet(file: File): Promise<string> {
  if (!['image/jpeg', 'image/png'].includes(file.type)) throw new Error('JPG 또는 PNG 파일만 업로드할 수 있어요.')
  const blob = await put(`sheets/${Date.now()}-${file.name}`, file, { access: 'public' })
  return blob.url
}

async function deleteSheet(url: string) {
  await del(url).catch(() => {})
}

export async function createSong(_: ActionState, formData: FormData): Promise<ActionState> {
  const title = (formData.get('title') as string)?.trim()
  const genre = formData.get('genre') as string
  if (!title || !genre) return { error: '제목과 장르는 필수입니다.' }

  const sheetFile = formData.get('sheet') as File | null
  let pdfPath: string | null = null
  if (sheetFile && sheetFile.size > 0) {
    pdfPath = await uploadSheet(sheetFile)
  }

  await prisma.song.create({
    data: {
      title,
      genre,
      key: nullIfEmpty(formData.get('key')),
      timeSignature: nullIfEmpty(formData.get('timeSignature')),
      memo: nullIfEmpty(formData.get('memo')),
      worshipTypes: formData.getAll('worshipTypes') as string[],
      pdfPath,
    },
  })

  revalidatePath('/songs')
  redirect('/songs')
}

export async function updateSong(id: number, _: ActionState, formData: FormData): Promise<ActionState> {
  const title = (formData.get('title') as string)?.trim()
  const genre = formData.get('genre') as string
  if (!title || !genre) return { error: '제목과 장르는 필수입니다.' }

  const sheetFile = formData.get('sheet') as File | null
  const existingUrl = formData.get('existingSheetUrl') as string | null
  let pdfPath: string | null | undefined = undefined

  if (sheetFile && sheetFile.size > 0) {
    pdfPath = await uploadSheet(sheetFile)
    if (existingUrl) await deleteSheet(existingUrl)
  }

  await prisma.song.update({
    where: { id },
    data: {
      title,
      genre,
      key: nullIfEmpty(formData.get('key')),
      timeSignature: nullIfEmpty(formData.get('timeSignature')),
      memo: nullIfEmpty(formData.get('memo')),
      worshipTypes: formData.getAll('worshipTypes') as string[],
      ...(pdfPath !== undefined ? { pdfPath } : {}),
    },
  })

  revalidatePath('/songs')
  redirect('/songs')
}

export async function deleteSheet_action(url: string): Promise<void> {
  await deleteSheet(url)
}

export async function createSongQuick(
  formData: FormData
): Promise<{ id: number; title: string; genre: string; key: string | null } | { error: string }> {
  const title = (formData.get('title') as string)?.trim()
  const genre = formData.get('genre') as string
  if (!title || !genre) return { error: '제목과 장르는 필수입니다.' }

  const song = await prisma.song.create({
    data: {
      title,
      genre,
      key: nullIfEmpty(formData.get('key')),
      timeSignature: null,
      memo: null,
      worshipTypes: [],
      pdfPath: null,
    },
    select: { id: true, title: true, genre: true, key: true },
  })

  revalidatePath('/songs')
  return song
}

export async function deleteSong(id: number): Promise<void> {
  const song = await prisma.song.findUnique({ where: { id }, select: { pdfPath: true } })
  if (song?.pdfPath) await deleteSheet(song.pdfPath)
  await prisma.song.delete({ where: { id } })
  revalidatePath('/songs')
  redirect('/songs')
}
