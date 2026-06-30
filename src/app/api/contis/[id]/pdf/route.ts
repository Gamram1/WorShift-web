import type { NextRequest } from 'next/server'
import { PDFDocument } from 'pdf-lib'
import { prisma } from '@/lib/prisma'

const A4_W = 595.28
const A4_H = 841.89

function isJpeg(url: string) { return /\.(jpg|jpeg)(\?|$)/i.test(url) }
function isPng(url: string) { return /\.png(\?|$)/i.test(url) }

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const conti = await prisma.conti.findUnique({
    where: { id: Number(id) },
    include: {
      songs: {
        include: { song: { select: { title: true, pdfPath: true } } },
        orderBy: { orderIndex: 'asc' },
      },
    },
  })

  if (!conti) return new Response('Not found', { status: 404 })

  const pdfDoc = await PDFDocument.create()

  for (const cs of conti.songs) {
    const url = cs.song.pdfPath
    if (!url) continue
    if (!isJpeg(url) && !isPng(url)) continue

    let imageBytes: ArrayBuffer
    try {
      const res = await fetch(url)
      if (!res.ok) continue
      imageBytes = await res.arrayBuffer()
    } catch {
      continue
    }

    try {
      const image = isJpeg(url)
        ? await pdfDoc.embedJpg(imageBytes)
        : await pdfDoc.embedPng(imageBytes)

      const scale = Math.min(A4_W / image.width, A4_H / image.height)
      const w = image.width * scale
      const h = image.height * scale

      const page = pdfDoc.addPage([A4_W, A4_H])
      page.drawImage(image, {
        x: (A4_W - w) / 2,
        y: (A4_H - h) / 2,
        width: w,
        height: h,
      })
    } catch {
      continue
    }
  }

  if (pdfDoc.getPageCount() === 0) {
    return new Response('악보 이미지가 없습니다.', { status: 400 })
  }

  const pdfBytes = await pdfDoc.save()

  return new Response(Buffer.from(pdfBytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="conti-${conti.date}.pdf"`,
    },
  })
}
