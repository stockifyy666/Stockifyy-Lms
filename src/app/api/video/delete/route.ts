import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { UTApi } from 'uploadthing/server'

const utapi = new UTApi()

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return new NextResponse('Forbidden', { status: 403 })

  const { id } = await req.json()

  const { data: video } = await supabase.from('videos').select('storage_path, storage_url').eq('id', id).single()
  if (!video) return new NextResponse('Not found', { status: 404 })

  // Delete from uploadthing if it was uploaded there
  if (video.storage_url) {
    // Extract the file key from the URL
    const key = video.storage_path
    await utapi.deleteFiles(key).catch(() => {})
  } else {
    // Delete from Supabase storage
    await supabase.storage.from('videos').remove([video.storage_path])
  }

  const { error } = await supabase.from('videos').delete().eq('id', id)
  if (error) return new NextResponse(error.message, { status: 500 })

  return new NextResponse('OK')
}
