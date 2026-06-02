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
interface MasterDataItem {
  id: string
  category: string
  value: string
  isActive: boolean
}

interface Category {
  title: string
  key: string
}

export default function DataPage() {
  const { toast } = useToast()
  const [items, setItems] = useState<Record<string, MasterDataItem[]>>({
    religion: [],
    maritalStatus: [],
    employmentStatus: [],
    bloodType: [],
  })

  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({
    religion: '',
    maritalStatus: '',
    employmentStatus: '',
    bloodType: '',
  })

  const [editingItem, setEditingItem] = useState<MasterDataItem | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [newItemValue, setNewItemValue] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const categoryConfig: Category[] = [
    { title: 'Religion', key: 'religion' },
    { title: 'Marital Status', key: 'maritalStatus' },
    { title: 'Employment Status', key: 'employmentStatus' },
    { title: 'Blood Type', key: 'bloodType' },
  ]

  // Fetch all categories on mount
  useEffect(() => {
    const fetchAllCategories = async () => {
      try {
        setIsLoading(true)
        const categoryKeys = ['religion', 'maritalStatus', 'employmentStatus', 'bloodType']
        const results: Record<string, MasterDataItem[]> = {}

        for (const key of categoryKeys) {
          const response = await fetch(`/api/master-data?category=${key}`)
          if (!response.ok) throw new Error(`Failed to fetch ${key}`)
          results[key] = await response.json()
        }

        setItems(results)
      } catch (error) {
        console.error('[v0] Error fetching master data:', error)
        toast({ title: 'Error', description: 'Failed to load data', variant: 'destructive' })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllCategories()
  }, [toast])

  const handleAddNewEntry = (categoryKey: string) => {
    setSelectedCategory(categoryKey)
    setEditingItem(null)
    setNewItemValue('')
    setIsDialogOpen(true)
  }

  const handleEditItem = (categoryKey: string, item: MasterDataItem) => {
    setSelectedCategory(categoryKey)
    setEditingItem(item)
    setNewItemValue(item.value)
    setIsDialogOpen(true)
  }

  const handleDeleteItem = async (categoryKey: string, itemId: string) => {
    try {
      const response = await fetch(`/api/master-data?id=${itemId}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete')
      setItems(prev => ({
        ...prev,
        [categoryKey]: prev[categoryKey].filter(item => item.id !== itemId)
      }))
      toast({ title: 'Success', description: 'Entry deleted successfully' })
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete entry', variant: 'destructive' })
    }
  }

  const handleSaveItem = async () => {
    if (!newItemValue.trim() || !selectedCategory) {
      toast({ title: 'Error', description: 'Value is required', variant: 'destructive' })
      return
    }

    setIsSaving(true)
    try {
      if (editingItem) {
        const response = await fetch('/api/master-data', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingItem.id, value: newItemValue.trim() })
        })
        if (!response.ok) throw new Error('Failed to update')
        const updated = await response.json()
        setItems(prev => ({
          ...prev,
          [selectedCategory]: prev[selectedCategory].map(item => item.id === updated.id ? updated : item)
        }))
        toast({ title: 'Success', description: 'Entry updated successfully' })
      } else {
        const response = await fetch('/api/master-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category: selectedCategory, value: newItemValue.trim() })
        })
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to create')
        }
        const created = await response.json()
        setItems(prev => ({
          ...prev,
          [selectedCategory]: [...prev[selectedCategory], created].sort((a, b) => a.value.localeCompare(b.value))
        }))
        toast({ title: 'Success', description: 'Entry added successfully' })
      }

      setIsDialogOpen(false)
      setEditingItem(null)
      setNewItemValue('')
      setSelectedCategory('')
    } catch (error) {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to save', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingItem(null)
    setNewItemValue('')
    setSelectedCategory('')
  }

  const getFilteredItems = (categoryKey: string) => {
    const query = searchQueries[categoryKey]?.toLowerCase() || ''
    if (!query) {
      return items[categoryKey] || []
    }
    return (items[categoryKey] || []).filter((item) =>
      item.value.toLowerCase().includes(query)
    )
  }

  const handleClearSearch = (categoryKey: string) => {
    setSearchQueries((prev) => ({
      ...prev,
      [categoryKey]: '',
    }))
  }

  if (isLoading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Management Data</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {categoryConfig.map((category) => {
          const filteredItems = getFilteredItems(category.key)
          return (
            <Card key={category.key} className="border border-border bg-card p-6 flex flex-col h-[35vh] overflow-hidden">
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
                  {filteredItems?.length > 0 ? (
                    filteredItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-lg border border-border bg-background p-3 hover:bg-muted transition-colors group w-full"
                      >
                        <span className="text-sm text-foreground truncate">{item.value}</span>
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
              <Label htmlFor="item-value">Value</Label>
              <Input
                id="item-value"
                value={newItemValue}
                onChange={(e) => setNewItemValue(e.target.value)}
                placeholder="Enter value"
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
