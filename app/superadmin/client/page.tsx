'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Plus, MoreVertical, Pencil, Trash2 } from 'lucide-react'

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

export default function ClientPage() {
  const [categories, setCategories] = useState<Record<string, CategoryItem[]>>({
    company: [],
    site: [],
  })

  const [editingItem, setEditingItem] = useState<CategoryItem | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [newItemName, setNewItemName] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const categoryConfig: Category[] = [
    { title: 'Company', key: 'company' },
    { title: 'Site', key: 'site' },
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

  const handleDeleteItem = (categoryKey: string, itemId: string) => {
    setCategories((prev) => {
      const updated = { ...prev }
      updated[categoryKey] = updated[categoryKey].filter((item) => item.id !== itemId)
      return updated
    })
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
    setEditingItem(null)
    setNewItemName('')
    setSelectedCategory('')
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingItem(null)
    setNewItemName('')
    setSelectedCategory('')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Management Client</h1>
      </div>

      {categoryConfig.map((category) => (
        <div key={category.key} className="space-y-4">
          <Card className="border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-card-foreground">{category.title}</h2>
              <Button
                onClick={() => handleAddNewEntry(category.key)}
                size="sm"
                className="gap-2 bg-primary hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                ADD NEW ENTRY
              </Button>
            </div>

            <div className="space-y-3">
              {categories[category.key]?.length > 0 ? (
                categories[category.key].map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-background p-4 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="h-10 w-10 flex items-center justify-center rounded-full font-semibold">
                        {item.abbreviation}
                      </Badge>
                      <span className="text-foreground">{item.name}</span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                          <MoreVertical className="h-4 w-4 text-primary" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditItem(category.key, item)} className="cursor-pointer">
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteItem(category.key, item.id)} className="cursor-pointer text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground">No entries yet. Click "ADD NEW ENTRY" to get started.</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      ))}

      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
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
                onKeyDown={(e) => e.key === 'Enter' && handleSaveItem()}
              />
            </div>
            <Button onClick={handleSaveItem} className="w-full">
              {editingItem ? 'Update' : 'Add'} Entry
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
