'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, MoreVertical, Pencil, Trash2, Search, X, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

// Types
interface CategoryItem {
  id: string
  value: string
  abbreviation?: string
}

interface Category {
  title: string
  key: string
}

export default function StructurePage() {
  const { toast } = useToast()
  const [categories, setCategories] = useState<Record<string, CategoryItem[]>>({
    department: [],
    position: [],
    certificate: [],
  })

  const [loading, setLoading] = useState<Record<string, boolean>>({
    department: true,
    position: true,
    certificate: true,
  })

  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({
    department: '',
    position: '',
    certificate: '',
  })

  const [editingItem, setEditingItem] = useState<CategoryItem | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [newItemName, setNewItemName] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const categoryConfig: Category[] = [
    { title: 'Department', key: 'department' },
    { title: 'Position', key: 'position' },
    { title: 'Certificate', key: 'certificate' },
  ]

  // Fetch data from database on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const results: Record<string, CategoryItem[]> = {}
        
        for (const cat of categoryConfig) {
          const response = await fetch(`/api/master-data?category=${cat.key}`)
          if (response.ok) {
            const data = await response.json()
            results[cat.key] = data.map((item: any) => ({
              id: item.id,
              value: item.value,
              abbreviation: item.value
                .split(' ')
                .map((word: string) => word[0])
                .join('')
                .toUpperCase()
                .slice(0, 3),
            }))
          }
          setLoading((prev) => ({ ...prev, [cat.key]: false }))
        }
        
        setCategories(results)
      } catch (error) {
        console.error('Failed to fetch categories:', error)
        toast({
          title: 'Error',
          description: 'Failed to fetch data from database',
          variant: 'destructive',
        })
      }
    }

    fetchCategories()
  }, [])

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

  const handleDeleteItem = async (categoryKey: string, itemId: string) => {
    try {
      const response = await fetch(`/api/master-data?id=${itemId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete')

      setCategories((prev) => ({
        ...prev,
        [categoryKey]: prev[categoryKey].filter((item) => item.id !== itemId),
      }))

      toast({
        title: 'Success',
        description: 'Entry deleted successfully',
      })
    } catch (error) {
      console.error('Error deleting item:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete entry',
        variant: 'destructive',
      })
    }
  }

  const handleSaveItem = async () => {
    if (!newItemName.trim() || !selectedCategory) return

    setIsSaving(true)
    try {
      if (editingItem) {
        // Update existing item
        const response = await fetch('/api/master-data', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingItem.id, value: newItemName }),
        })

        if (!response.ok) throw new Error('Failed to update')

        const updated = await response.json()
        setCategories((prev) => {
          const newCategories = { ...prev }
          const index = newCategories[selectedCategory].findIndex((item) => item.id === editingItem.id)
          if (index !== -1) {
            newCategories[selectedCategory][index] = {
              id: updated.id,
              value: updated.value,
              abbreviation: updated.value
                .split(' ')
                .map((word: string) => word[0])
                .join('')
                .toUpperCase()
                .slice(0, 3),
            }
          }
          return newCategories
        })

        toast({
          title: 'Success',
          description: 'Entry updated successfully',
        })
      } else {
        // Create new item
        const response = await fetch('/api/master-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category: selectedCategory, value: newItemName }),
        })

        if (!response.ok) {
          if (response.status === 409) {
            throw new Error('Entry already exists')
          }
          throw new Error('Failed to create')
        }

        const newEntry = await response.json()
        const abbreviation = newItemName
          .split(' ')
          .map((word: string) => word[0])
          .join('')
          .toUpperCase()
          .slice(0, 3)

        setCategories((prev) => ({
          ...prev,
          [selectedCategory]: [
            ...prev[selectedCategory],
            { id: newEntry.id, value: newEntry.value, abbreviation },
          ],
        }))

        toast({
          title: 'Success',
          description: 'Entry added successfully',
        })
      }

      setIsDialogOpen(false)
      setEditingItem(null)
      setNewItemName('')
      setSelectedCategory('')
    } catch (error) {
      console.error('Error saving item:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save entry',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingItem(null)
    setNewItemName('')
    setSelectedCategory('')
  }

  const getFilteredItems = (categoryKey: string) => {
    const query = searchQueries[categoryKey]?.toLowerCase() || ''
    if (!query) {
      return categories[categoryKey] || []
    }
    return (categories[categoryKey] || []).filter((item) =>
      item.name.toLowerCase().includes(query) || item.abbreviation.toLowerCase().includes(query)
    )
  }

  const handleClearSearch = (categoryKey: string) => {
    setSearchQueries((prev) => ({
      ...prev,
      [categoryKey]: '',
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Management Structure</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categoryConfig.map((category) => {
          const filteredItems = getFilteredItems(category.key)
          return (
            <Card key={category.key} className="border border-border bg-card p-6 flex flex-col h-96 max-h-96 overflow-hidden">
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <h2 className="text-base font-semibold text-card-foreground">{category.title}</h2>
                <Button
                  onClick={() => handleAddNewEntry(category.key)}
                  size="sm"
                  className="gap-2 bg-primary hover:bg-primary/90 h-8 px-2"
                >
                  <Plus className="h-3 w-3" />
                  <span className="text-xs">Add</span>
                </Button>
              </div>

              {/* Search Filter */}
              <div className="mb-4 relative flex-shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  placeholder={`Search ${category.title.toLowerCase()}...`}
                  value={searchQueries[category.key] || ''}
                  onChange={(e) =>
                    setSearchQueries((prev) => ({
                      ...prev,
                      [category.key]: e.target.value,
                    }))
                  }
                  className="pl-10 pr-10 h-9 text-sm w-full"
                />
                {searchQueries[category.key] && (
                  <button
                    onClick={() => handleClearSearch(category.key)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <ScrollArea className="flex-1 -mr-6 pr-6 w-full overflow-hidden">
                <div className="space-y-2 pr-4">
                  {loading[category.key] ? (
                    <div className="py-8 flex items-center justify-center">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  ) : filteredItems?.length > 0 ? (
                    filteredItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-lg border border-border bg-background p-3 hover:bg-muted transition-colors group w-full"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Badge variant="outline" className="h-8 w-8 flex items-center justify-center rounded-full font-semibold flex-shrink-0 text-xs">
                            {item.abbreviation}
                          </Badge>
                          <span className="text-sm text-foreground truncate">{item.value}</span>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-muted flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreVertical className="h-3 w-3 text-muted-foreground" />
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
                    <div className="py-8 text-center">
                      <p className="text-xs text-muted-foreground">
                        {searchQueries[category.key] ? 'No matches found.' : 'No entries yet'}
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </Card>
          )
        })}
      </div>

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
            <Button onClick={handleSaveItem} className="w-full" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {editingItem ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                <>{editingItem ? 'Update' : 'Add'} Entry</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
