import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: video } = await supabase
    .from('videos')
    .select('storage_path, storage_url, expires_at, is_active')
    .eq('id', id)
    .eq('is_active', true)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (!video) return new NextResponse('Not found', { status: 404 })

  // Use uploadthing URL if available, otherwise fall back to Supabase signed URL
  let videoUrl: string
  if (video.storage_url) {
    videoUrl = video.storage_url
  } else {
    const { data: signed } = await supabase.storage
      .from('videos')
      .createSignedUrl(video.storage_path, 300)
    if (!signed) return new NextResponse('Not found', { status: 404 })
    videoUrl = signed.signedUrl
  }

  const range = req.headers.get('range')
  const upstream = await fetch(videoUrl, {
    headers: range ? { range } : {},
  })

  const headers = new Headers()
  headers.set('Content-Type', upstream.headers.get('Content-Type') ?? 'video/mp4')
  headers.set('Content-Disposition', 'inline')
  headers.set('Cache-Control', 'no-store')
  headers.set('X-Content-Type-Options', 'nosniff')

  const contentLength = upstream.headers.get('Content-Length')
  if (contentLength) headers.set('Content-Length', contentLength)
  const contentRange = upstream.headers.get('Content-Range')
  if (contentRange) headers.set('Content-Range', contentRange)
  const acceptRanges = upstream.headers.get('Accept-Ranges')
  if (acceptRanges) headers.set('Accept-Ranges', acceptRanges)

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers,
  })
}
