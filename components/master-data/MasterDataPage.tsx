'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

// Daftar kategori dropdown yang ada di form Add Employee lu
const CATEGORIES = [
  { id: 'DEPARTMENT', label: 'Department' },
  { id: 'POSITION', label: 'Position' },
  { id: 'EMPLOYMENT_STATUS', label: 'Employment Status' },
  { id: 'MARITAL_STATUS', label: 'Marital Status' },
  { id: 'RELIGION', label: 'Religion' },
  { id: 'BLOOD_TYPE', label: 'Blood Type' },
  { id: 'CERTIFICATION', label: 'Certification Level' },
]

export default function MasterDataPage() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    category: '',
    value: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.category || !formData.value) {
      toast.error('Pilih kategori dan isi valuenya dulu')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/master-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()
      if (data.success) {
        toast.success('Data berhasil ditambah')
        setFormData({ ...formData, value: '' }) 
      } else {
        toast.error(data.error || 'Gagal menyimpan data')
      }
    } catch (error) {
      toast.error('Sistem error pas nyimpen data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Master Data Settings</h1>
        <p className="text-gray-500 text-sm mt-1">
          Atur semua pilihan dropdown untuk form karyawan di sini.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Input Kategori */}
          <div className="space-y-2">
            <Label>Kategori Dropdown <span className="text-red-500">*</span></Label>
            <Select 
              value={formData.category} 
              onValueChange={(val) => setFormData({...formData, category: val})}
            >
              <SelectTrigger><SelectValue placeholder="Pilih Kategori" /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Input Value / Isian */}
          <div className="space-y-2">
            <Label>Isi Pilihan (Value) <span className="text-red-500">*</span></Label>
            <Input 
              placeholder="Contoh: Field Security / Islam / O" 
              value={formData.value}
              onChange={(e) => setFormData({...formData, value: e.target.value})}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Menyimpan...' : 'Tambah Data'}
          </Button>
          
        </form>
      </div>
    </div>
  )
}
