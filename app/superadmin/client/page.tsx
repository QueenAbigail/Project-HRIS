'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { Plus, MoreVertical, Pencil, Trash2, ChevronDown, Search, X, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Site {
  id: string
  name: string
  code: string
  latitude?: number | null
  longitude?: number | null
}

interface Company {
  id: string
  name: string
  sites: Site[]
}

export default function ClientPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [companies, setCompanies] = useState<Company[]>([])
  const [editingItem, setEditingItem] = useState<Company | Site | null>(null)
  const [editingCompanyId, setEditingCompanyId] = useState('')
  const [editingType, setEditingType] = useState<'company' | 'site' | ''>('')
  const [newItemName, setNewItemName] = useState('')
  const [newItemCode, setNewItemCode] = useState('')
  const [newItemLatitude, setNewItemLatitude] = useState('')
  const [newItemLongitude, setNewItemLongitude] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/companies')
        const data = await response.json()
        if (data.error) throw new Error(data.error)
        setCompanies(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Error fetching companies:', error)
        toast({ title: 'Error', description: 'Failed to load companies', variant: 'destructive' })
      } finally {
        setIsLoading(false)
      }
    }
    fetchCompanies()
  }, [toast])

  const filteredCompanies = companies
    .map((company) => ({
      ...company,
      sites: (company.sites || []).filter((site) =>
        site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        site.code.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter(
      (company) =>
        company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.sites.length > 0
    )

  const handleAddCompany = () => {
    setEditingType('company')
    setEditingItem(null)
    setNewItemName('')
    setEditingCompanyId('')
    setIsDialogOpen(true)
  }

  const handleAddSite = (companyId: string) => {
    setEditingType('site')
    setEditingItem(null)
    setNewItemName('')
    setNewItemCode('')
    setNewItemLatitude('')
    setNewItemLongitude('')
    setEditingCompanyId(companyId)
    setIsDialogOpen(true)
  }

  const handleEditCompany = (company: Company) => {
    setEditingType('company')
    setEditingItem(company)
    setNewItemName(company.name)
    setEditingCompanyId(company.id)
    setIsDialogOpen(true)
  }

  const handleEditSite = (companyId: string, site: Site) => {
    setEditingType('site')
    setEditingItem(site)
    setNewItemName(site.name)
    setNewItemCode(site.code)
    setNewItemLatitude(site.latitude ? String(site.latitude) : '')
    setNewItemLongitude(site.longitude ? String(site.longitude) : '')
    setEditingCompanyId(companyId)
    setIsDialogOpen(true)
  }

  const handleDeleteCompany = async (companyId: string) => {
    try {
      const response = await fetch(`/api/companies?id=${companyId}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete')
      setCompanies(prev => prev.filter(c => c.id !== companyId))
      toast({ title: 'Success', description: 'Company deleted successfully' })
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete company', variant: 'destructive' })
    }
  }

  const handleDeleteSite = async (companyId: string, siteId: string) => {
    try {
      const response = await fetch(`/api/companies/${companyId}/sites?siteId=${siteId}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete')
      setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, sites: c.sites.filter(s => s.id !== siteId) } : c))
      toast({ title: 'Success', description: 'Site deleted successfully' })
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete site', variant: 'destructive' })
    }
  }

  const handleSaveItem = async () => {
    if (!newItemName.trim()) {
      toast({ title: 'Error', description: 'Name is required', variant: 'destructive' })
      return
    }

    if (editingType === 'site' && !newItemCode.trim()) {
      toast({ title: 'Error', description: 'Code is required', variant: 'destructive' })
      return
    }

    setIsSaving(true)
    try {
      if (editingType === 'company') {
        const method = editingItem ? 'PUT' : 'POST'
        const body = editingItem ? { id: editingItem.id, name: newItemName } : { name: newItemName }
        const response = await fetch('/api/companies', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        if (!response.ok) throw new Error('Failed to save')
        const result = await response.json()

        if (editingItem) {
          setCompanies(prev => prev.map(c => c.id === editingItem.id ? { ...c, name: newItemName } : c))
        } else {
          setCompanies(prev => [...prev, { id: result.id, name: result.name, sites: [] }])
        }
        toast({ title: 'Success', description: editingItem ? 'Company updated' : 'Company added' })
      } else if (editingType === 'site') {
        const method = editingItem ? 'PUT' : 'POST'
        const latitude = newItemLatitude ? parseFloat(newItemLatitude) : null
        const longitude = newItemLongitude ? parseFloat(newItemLongitude) : null
        const body = editingItem 
          ? { siteId: editingItem.id, name: newItemName, code: newItemCode, latitude, longitude } 
          : { name: newItemName, code: newItemCode, latitude, longitude }
        const response = await fetch(`/api/companies/${editingCompanyId}/sites`, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Failed to save')
        }
        const result = await response.json()

        setCompanies(prev => prev.map(c => c.id === editingCompanyId ? { ...c, sites: editingItem ? c.sites.map(s => s.id === editingItem.id ? { id: s.id, name: newItemName, code: newItemCode, latitude, longitude } : s) : [...c.sites, { id: result.id, name: result.name, code: result.code, latitude: result.latitude, longitude: result.longitude }] } : c))
        toast({ title: 'Success', description: editingItem ? 'Site updated successfully' : 'Site added successfully' })
      }

      setIsDialogOpen(false)
      setEditingItem(null)
      setNewItemName('')
      setNewItemCode('')
      setNewItemLatitude('')
      setNewItemLongitude('')
      setEditingCompanyId('')
      setEditingType('')
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to save'
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Management Client</h1>
        <Button onClick={handleAddCompany} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Company
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          placeholder="Search by company or site name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10 h-10"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="space-y-3">
        {filteredCompanies.length > 0 ? (
          filteredCompanies.map((company) => (
            <Collapsible key={company.id} className="border border-border rounded-lg bg-card">
              <CollapsibleTrigger asChild>
                <button className="w-full flex items-center justify-between p-4 hover:bg-muted/50">
                  <div className="flex items-center gap-4 flex-1 text-left">
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    <Badge variant="outline" className="h-10 w-10 flex items-center justify-center rounded-full text-xs">
                      {company.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 3)}
                    </Badge>
                    <div className="flex-1">
                      <div className="font-semibold">{company.name}</div>
                      <div className="text-xs text-muted-foreground">{company.sites.length} site(s)</div>
                    </div>
                  </div>
                </button>
              </CollapsibleTrigger>

              <CollapsibleContent className="px-4 pb-4 space-y-2 border-t border-border">
                <div className="flex gap-2 pt-4 mb-4">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => handleAddSite(company.id)}>
                    <Plus className="h-3 w-3 mr-2" />
                    Add Site
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditCompany(company)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteCompany(company.id)} className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {company.sites.length > 0 ? (
                  <div className="space-y-2">
                    {company.sites.map((site) => (
                      <div key={site.id} className="flex items-center justify-between rounded-lg border border-border bg-background p-3 hover:bg-muted group">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Badge variant="outline" className="h-8 w-8 flex items-center justify-center rounded-full text-xs bg-muted">
                            {site.code}
                          </Badge>
                          <span className="text-sm text-foreground truncate">{site.name}</span>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                              <MoreVertical className="h-3 w-3 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditSite(company.id, site)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteSite(company.id, site.id)} className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-4 text-center">
                    <p className="text-sm text-muted-foreground">No sites yet. Click "Add Site" to get started.</p>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          ))
        ) : (
          <div className="py-12 text-center border border-border rounded-lg bg-card p-6">
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 'No companies or sites match your search.' : 'No companies yet'}
            </p>
            {!searchQuery && (
              <Button onClick={handleAddCompany} className="gap-2">
                <Plus className="h-4 w-4" />
                Add First Company
              </Button>
            )}
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={() => setIsDialogOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingType === 'company'
                ? editingItem && !('code' in editingItem)
                  ? 'Edit Company'
                  : 'Add New Company'
                : editingItem
                  ? 'Edit Site'
                  : 'Add New Site'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{editingType === 'company' ? 'Company' : 'Site'} Name</Label>
              <Input
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder={`Enter ${editingType === 'company' ? 'company' : 'site'} name`}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveItem()}
              />
            </div>
            {editingType === 'site' && (
              <>
                <div className="space-y-2">
                  <Label>Site Code</Label>
                  <Input
                    value={newItemCode}
                    onChange={(e) => setNewItemCode(e.target.value.toUpperCase())}
                    placeholder="e.g., HOJ"
                    maxLength={20}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveItem()}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Latitude</Label>
                    <Input
                      type="number"
                      step="0.00000001"
                      value={newItemLatitude}
                      onChange={(e) => setNewItemLatitude(e.target.value)}
                      placeholder="e.g., -6.2088"
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveItem()}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Longitude</Label>
                    <Input
                      type="number"
                      step="0.00000001"
                      value={newItemLongitude}
                      onChange={(e) => setNewItemLongitude(e.target.value)}
                      placeholder="e.g., 106.8456"
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveItem()}
                    />
                  </div>
                </div>
              </>
            )}
            <Button onClick={handleSaveItem} className="w-full" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {editingItem ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                <>{editingItem ? 'Update' : 'Add'} {editingType === 'company' ? 'Company' : 'Site'}</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
