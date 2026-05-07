'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Pencil, Plus } from 'lucide-react'

// Types
interface CategoryItem {
  id: string
  name: string
  abbreviation: string
}

interface Category {
  title: string
  key: string
  items: CategoryItem[]
}

export default function ClientPage() {
  const [categories, setCategories] = useState<Record<string, CategoryItem[]>>({
    company: [
      { id: '1', name: 'PT Maju Jaya', abbreviation: 'PMJ' },
      { id: '2', name: 'PT Digital Indonesia', abbreviation: 'PDI' },
      { id: '3', name: 'PT Tech Solutions', abbreviation: 'PTS' },
    ],
    site: [
      { id: '1', name: 'Site Jakarta', abbreviation: 'SJ' },
      { id: '2', name: 'Site Bandung', abbreviation: 'SB' },
      { id: '3', name: 'Site Surabaya', abbreviation: 'SS' },
    ],
  })

  const [editingItem, setEditingItem] = useState<CategoryItem | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [newItemName, setNewItemName] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const categoryConfig: Category[] = [
    { title: 'Kategori Data: Company', key: 'company', items: categories.company },
    { title: 'Kategori Data: Site', key: 'site', items: categories.site },
  ]

  const handleAddNewEntry = (categoryKey: string) => {
    setSelectedCategory(categoryKey)
    setEditingItem(null)
    setNewItemName('')
    setIsDialogOpen(true)
  }

  const handleEditItem = (categoryKey: string, item: CategoryItem) => {
    setSelectedCategory(categoryKey)
    setEditingItem(item)
    setNewItemName(item.name)
    setIsDialogOpen(true)
  }

  const handleSaveItem = () => {
    if (!newItemName.trim() || !selectedCategory) return

    setCategories((prev) => {
      const updated = { ...prev }
      if (editingItem) {
        const itemIndex = updated[selectedCategory].findIndex((item) => item.id === editingItem.id)
        if (itemIndex !== -1) {
          updated[selectedCategory][itemIndex].name = newItemName
        }
      } else {
        const newAbbr = newItemName
          .split(' ')
          .map((word) => word[0])
          .join('')
          .toUpperCase()
          .slice(0, 3)
        updated[selectedCategory].push({
          id: Date.now().toString(),
          name: newItemName,
          abbreviation: newAbbr,
        })
      }
      return updated
    })

    setIsDialogOpen(false)
    setNewItemName('')
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Management Client</h1>
      </div>

      {categoryConfig.map((category) => (
        <div key={category.key} className="space-y-4">
          <Card className="border border-slate-200 bg-slate-900/50 dark:border-slate-700 dark:bg-slate-900/80 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-200">{category.title}</h2>
              <Dialog open={isDialogOpen && selectedCategory === category.key} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => handleAddNewEntry(category.key)}
                    className="gap-2 bg-lime-400 hover:bg-lime-500 text-black font-semibold"
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                    ADD NEW ENTRY
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingItem ? 'Edit Entry' : 'Add New Entry'}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="item-name">Name</Label>
                      <Input
                        id="item-name"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        placeholder="Enter name"
                      />
                    </div>
                    <Button onClick={handleSaveItem} className="w-full">
                      {editingItem ? 'Update' : 'Add'} Entry
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-3">
              {category.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/50 p-4 hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="h-10 w-10 flex items-center justify-center rounded-full text-slate-300 font-semibold">
                      {item.abbreviation}
                    </Badge>
                    <span className="text-slate-100">{item.name}</span>
                  </div>
                  <Button
                    onClick={() => handleEditItem(category.key, item)}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-slate-700"
                  >
                    <Pencil className="h-4 w-4 text-lime-400" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ))}
    </div>
  )
}
