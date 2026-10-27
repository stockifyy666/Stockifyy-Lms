'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { RiDeleteBin2Line, RiVideoLine, RiTimeLine } from 'react-icons/ri'

interface Video {
  id: string; title: string; description: string
  storage_path: string; storage_url?: string; expires_at: string; created_at: string; is_active: boolean
}

export default function AdminVideoList({ videos }: { videos: Video[] }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(video: Video) {
    if (!confirm(`Delete "${video.title}"? This cannot be undone.`)) return
    setDeleting(video.id)
    const res = await fetch('/api/video/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: video.id }),
    })
    if (!res.ok) toast.error('Failed to delete video')
    else { toast.success(`"${video.title}" deleted`); router.refresh() }
    setDeleting(null)
  }

  function getDaysLeft(expiresAt: string) {
    return Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86400000)
  }

  if (videos.length === 0) {
    return (
      <div className="empty-state">
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, color: 'var(--accent)', fontSize: 22 }}>
          <RiVideoLine />
        </div>
        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>No videos yet</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Upload your first video using the form above</div>
      </div>
    )
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="data-table">
        <thead>
          <tr>
            <th>Video</th>
            <th>Uploaded</th>
            <th>Expires</th>
            <th>Status</th>
            <th style={{ textAlign: 'right' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {videos.map(video => {
            const daysLeft = getDaysLeft(video.expires_at)
            const expiryColor = daysLeft <= 1 ? 'var(--danger)' : daysLeft <= 3 ? 'var(--warning)' : 'var(--success)'
            const expiryBg = daysLeft <= 1 ? 'var(--danger-bg)' : daysLeft <= 3 ? 'var(--warning-bg)' : 'var(--success-bg)'
            return (
              <tr key={video.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <RiVideoLine style={{ color: 'var(--accent)', fontSize: 16 }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text-primary)' }}>{video.title}</div>
                      {video.description && (
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {video.description}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                  {new Date(video.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td>
                  <span className="badge" style={{ background: expiryBg, color: expiryColor }}>
                    <RiTimeLine style={{ fontSize: 11 }} />
                    {daysLeft > 0 ? `${daysLeft}d left` : 'Expired'}
                  </span>
                </td>
                <td>
                  <span className="badge" style={{ background: video.is_active ? 'var(--success-bg)' : 'var(--bg-hover)', color: video.is_active ? 'var(--success)' : 'var(--text-muted)' }}>
                    {video.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    onClick={() => handleDelete(video)}
                    disabled={deleting === video.id}
                    className="btn btn-danger"
                    style={{ fontSize: 12, padding: '5px 12px' }}
                  >
                    <RiDeleteBin2Line style={{ fontSize: 13 }} />
                    {deleting === video.id ? 'Deleting…' : 'Delete'}
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
