import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import { Certificate } from '@/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Award, ExternalLink, Trash2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

export function Certificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', issuer: '', issueDate: '', expiryDate: '', credentialId: '', url: '' })

  useEffect(() => { load() }, [])

  function load() { api.get<Certificate[]>('/certificates').then(setCertificates) }

  async function create() {
    try { await api.post('/certificates', form); toast.success('Certificate added'); setShowForm(false); setForm({ name: '', issuer: '', issueDate: '', expiryDate: '', credentialId: '', url: '' }); load() } catch (e: any) { toast.error(e.message) }
  }

  async function remove(id: string) {
    if (!confirm('Delete this certificate?')) return
    await api.delete(`/certificates/${id}`)
    toast.success('Certificate deleted')
    load()
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Certificates</h1>
          <p className="text-sm text-gray-400 mt-1">{certificates.length} certificates</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="w-4 h-4" /> Add Certificate</Button>
      </div>

      {showForm && (
        <Card className="p-5">
          <div className="grid sm:grid-cols-3 gap-4">
            <Input placeholder="Certificate name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <Input placeholder="Issuer" value={form.issuer} onChange={e => setForm({ ...form, issuer: e.target.value })} />
            <Input type="date" placeholder="Issue date" value={form.issueDate} onChange={e => setForm({ ...form, issueDate: e.target.value })} />
            <Input type="date" placeholder="Expiry date" value={form.expiryDate} onChange={e => setForm({ ...form, expiryDate: e.target.value })} />
            <Input placeholder="Credential ID" value={form.credentialId} onChange={e => setForm({ ...form, credentialId: e.target.value })} />
            <Input placeholder="Credential URL" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} />
            <Button onClick={create}>Save Certificate</Button>
          </div>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {certificates.map(c => (
          <Card key={c.id} className="p-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate">{c.name}</h3>
                <p className="text-xs text-gray-400">{c.issuer}</p>
              </div>
            </div>
            <div className="space-y-1 text-xs text-gray-500 mb-3">
              {c.issueDate && <p>Issued: {formatDate(c.issueDate)}</p>}
              {c.expiryDate && <p>Expires: {formatDate(c.expiryDate)}</p>}
              {c.credentialId && <p className="truncate">ID: {c.credentialId}</p>}
            </div>
            <div className="flex items-center gap-2">
              {c.url && <a href={c.url} target="_blank" rel="noreferrer" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1"><ExternalLink className="w-3 h-3" /> View Credential</a>}
              <Button variant="danger" size="sm" className="ml-auto" onClick={() => remove(c.id)}><Trash2 className="w-3 h-3" /></Button>
            </div>
          </Card>
        ))}
      </div>
    </motion.div>
  )
}
