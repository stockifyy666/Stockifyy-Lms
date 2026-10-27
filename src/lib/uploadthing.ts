import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { createClient } from '@/lib/supabase/server'

const f = createUploadthing()

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') throw new Error('Forbidden')
  return { userId: user.id }
}

export const ourFileRouter = {
  videoUploader: f({ video: { maxFileSize: '2GB', maxFileCount: 1 } })
    .middleware(requireAdmin)
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl, key: file.key }
    }),

  thumbnailUploader: f({ image: { maxFileSize: '8MB', maxFileCount: 1 } })
    .middleware(requireAdmin)
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl, key: file.key }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
