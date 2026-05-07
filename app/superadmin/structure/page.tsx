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
}

export default function StructurePage() {
  const [categories, setCategories] = useState<Record<string, CategoryItem[]>>({
    department: [],
    position: [],
    certificate: [],
    religion: [],
    maritalStatus: [],
    employmentStatus: [],
    bloodType: [],
  })

  const [editingItem, setEditingItem] = useState<CategoryItem | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [newItemName, setNewItemName] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const categoryConfig: Category[] = [
    { title: 'Department', key: 'department' },
    { title: 'Position', key: 'position' },
    { title: 'Certificate', key: 'certificate' },
    { title: 'Religion', key: 'religion' },
    { title: 'Marital Status', key: 'maritalStatus' },
    { title: 'Employment Status', key: 'employmentStatus' },
    { title: 'Blood Type', key: 'bloodType' },
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Management Structure</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categoryConfig.map((category) => (
          <Card key={category.key} className="border border-border bg-card p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-semibold text-card-foreground">{category.title}</h2>
              <Dialog open={isDialogOpen && selectedCategory === category.key} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => handleAddNewEntry(category.key)}
                    size="sm"
                    className="gap-2 bg-primary hover:bg-primary/90 h-8 px-2"
                  >
                    <Plus className="h-3 w-3" />
                    <span className="text-xs">Add</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingItem ? 'Edit Entry' : 'Add New Entry'} - {category.title}</DialogTitle>
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

            <div className="space-y-2 flex-1">
              {categories[category.key]?.length > 0 ? (
                categories[category.key].map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-background p-3 hover:bg-muted transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Badge variant="outline" className="h-8 w-8 flex items-center justify-center rounded-full font-semibold flex-shrink-0 text-xs">
                        {item.abbreviation}
                      </Badge>
                      <span className="text-sm text-foreground truncate">{item.name}</span>
                    </div>
                    <Button
                      onClick={() => handleEditItem(category.key, item)}
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-muted flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Pencil className="h-3 w-3 text-primary" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center">
                  <p className="text-xs text-muted-foreground">No entries yet</p>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
