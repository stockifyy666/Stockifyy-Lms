'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useUploadThing } from '@/lib/uploadthing-client'
import { RiUploadCloud2Line, RiVideoLine, RiCloseLine } from 'react-icons/ri'

const MAX_SIZE = 2 * 1024 * 1024 * 1024 // 2GB

export default function VideoUploadForm() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)

  const { startUpload } = useUploadThing('videoUploader', {
    onUploadProgress: (p) => setProgress(Math.round(p * 0.9)),
  })

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return

    setUploading(true)
    setProgress(0)
    const uploadToast = toast.loading('Uploading video…')

    const res = await startUpload([file]).catch(err => {
      toast.error(err?.message ?? 'Upload failed', { id: uploadToast })
      setUploading(false); setProgress(0)
      return null
    })

    if (!res?.[0]) return

    const { url, key } = res[0].serverData as { url: string; key: string }
    setProgress(90)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const { error: dbError } = await supabase.from('videos').insert({
      title,
      description,
      storage_path: key,
      storage_url: url,
      uploaded_by: user!.id,
      expires_at: expiresAt.toISOString(),
    })

    if (dbError) {
      toast.error(dbError.message, { id: uploadToast })
      setUploading(false); setProgress(0); return
    }

    setProgress(100)
    toast.success('Video uploaded successfully!', { id: uploadToast })
    setTitle(''); setDescription(''); setFile(null); setProgress(0)
    if (fileRef.current) fileRef.current.value = ''
    setUploading(false)
    router.refresh()
  }

  const tooLarge = file ? file.size > MAX_SIZE : false
  const fileSizeMB = file ? (file.size / 1024 / 1024).toFixed(1) : null

  return (
    <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div className="upload-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label className="form-label">
            Video Title <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <input
            className="input" type="text" required value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Lecture 1 — Introduction to DSA"
          />
        </div>

        <div>
          <label className="form-label">
            Video File{' '}
            <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>— max 2 GB</span>
          </label>
          <label style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 13px', borderRadius: 8, cursor: 'pointer',
            border: `1px solid ${tooLarge ? 'var(--danger)' : 'var(--border)'}`,
            background: 'var(--bg-card)', transition: 'border-color 0.15s',
          }}>
            <RiVideoLine style={{ fontSize: 16, color: 'var(--accent)', flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: file ? 'var(--text-primary)' : 'var(--text-muted)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {file ? file.name : 'Choose a video file…'}
            </span>
            {fileSizeMB && (
              <span className="badge" style={{ background: tooLarge ? 'var(--danger-bg)' : 'var(--success-bg)', color: tooLarge ? 'var(--danger)' : 'var(--success)', flexShrink: 0 }}>
                {fileSizeMB} MB
              </span>
            )}
            <input ref={fileRef} type="file" accept="video/*" required onChange={e => setFile(e.target.files?.[0] ?? null)} style={{ display: 'none' }} />
          </label>
          {tooLarge && <p style={{ fontSize: 12, color: 'var(--danger)', margin: '4px 0 0' }}>Too large — maximum 2 GB</p>}
        </div>
      </div>

      <div>
        <label className="form-label">Description <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>— optional</span></label>
        <textarea
          className="input" value={description} onChange={e => setDescription(e.target.value)}
          rows={2} placeholder="Brief description of this lecture…" style={{ resize: 'none' }}
        />
      </div>

      {uploading && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
            <span>Uploading…</span><span>{progress}%</span>
          </div>
          <div style={{ height: 4, borderRadius: 99, background: 'var(--border)', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 99, background: 'var(--accent)', width: `${progress}%`, transition: 'width 0.5s' }} />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <button type="submit" className="btn btn-primary" disabled={uploading || !file || tooLarge}>
          <RiUploadCloud2Line style={{ fontSize: 16 }} />
          {uploading ? 'Uploading…' : 'Upload Video'}
        </button>
        {(title || file) && !uploading && (
          <button type="button" className="btn btn-ghost" onClick={() => {
            setTitle(''); setDescription(''); setFile(null)
            if (fileRef.current) fileRef.current.value = ''
          }}>
            <RiCloseLine style={{ fontSize: 16 }} />
            Clear
          </button>
        )}
        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>
          Auto-deletes in 7 days
        </span>
      </div>
    </form>
  )
}
