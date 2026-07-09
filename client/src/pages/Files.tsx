import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import { FileItem } from '@/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Upload, Trash2, FileText, Image, FileSpreadsheet, FileArchive, Video, Music, FileCode, File, FolderOpen, Download } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

function formatSize(bytes: number) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return Image
  if (type.startsWith('video/')) return Video
  if (type.startsWith('audio/')) return Music
  if (type.includes('pdf') || type.includes('word') || type.includes('document')) return FileText
  if (type.includes('spreadsheet') || type.includes('excel') || type.includes('csv')) return FileSpreadsheet
  if (type.includes('zip') || type.includes('rar') || type.includes('tar') || type.includes('7z')) return FileArchive
  if (type.includes('javascript') || type.includes('typescript') || type.includes('json') || type.includes('html') || type.includes('css')) return FileCode
  return File
}

export function Files() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [uploading, setUploading] = useState(false)
  const [folder, setFolder] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { load() }, [])

  function load() { api.get<FileItem[]>('/files').then(setFiles) }

  async function upload(file: File) {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      if (folder) fd.append('folder', folder)
      await api.post('/files/upload', fd)
      toast.success('File uploaded')
      load()
      if (fileRef.current) fileRef.current.value = ''
    } catch (e: any) { toast.error(e.message) } finally { setUploading(false) }
  }

  async function remove(id: string) {
    if (!confirm('Delete this file?')) return
    await api.delete(`/files/${id}`)
    toast.success('File deleted')
    load()
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Files</h1>
          <p className="text-sm text-gray-400 mt-1">{files.length} files</p>
        </div>
        <div className="flex items-center gap-3">
          <Input placeholder="Folder name" value={folder} onChange={e => setFolder(e.target.value)} className="max-w-40" />
          <input type="file" ref={fileRef} onChange={e => e.target.files?.[0] && upload(e.target.files[0])} className="hidden" />
          <Button onClick={() => fileRef.current?.click()} loading={uploading}><Upload className="w-4 h-4" /> Upload</Button>
        </div>
      </div>

      <Card>
        <div className="divide-y divide-white/5">
          {files.map(f => {
            const Icon = getFileIcon(f.type)
            return (
              <div key={f.id} className="flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-all">
                <div className="w-9 h-9 rounded-lg bg-violet-500/20 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-violet-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{f.name}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                    <span>{formatSize(f.size)}</span>
                    <span>{f.type}</span>
                    <span>{formatDate(f.createdAt)}</span>
                    {f.folder && (
                      <span className="flex items-center gap-1">
                        <FolderOpen className="w-3 h-3" /> {f.folder}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a href={f.url} target="_blank" rel="noreferrer" className="p-2 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-all">
                    <Download className="w-4 h-4" />
                  </a>
                  <Button variant="danger" size="sm" onClick={() => remove(f.id)}><Trash2 className="w-3 h-3" /></Button>
                </div>
              </div>
            )
          })}
          {files.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-8">No files uploaded yet</p>
          )}
        </div>
      </Card>
    </motion.div>
  )
}
