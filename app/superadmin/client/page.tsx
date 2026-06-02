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

// Types
interface Site {
  id: string
  name: string
  code: string
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
  const [editingCompanyId, setEditingCompanyId] = useState<string>('')
  const [editingType, setEditingType] = useState<'company' | 'site' | ''>('')
  const [newItemName, setNewItemName] = useState('')
  const [newItemCode, setNewItemCode] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch companies on mount
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/companies')
        if (!response.ok) throw new Error('Failed to fetch')
        const data = await response.json()
        if (data.error) throw new Error(data.error)
        setCompanies(data)
      } catch (error) {
        console.error('[v0] Error fetching companies:', error)
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
      sites: company.sites.filter((site) =>
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
        const body = editingItem
          ? { id: editingItem.id, name: newItemName }
          : { name: newItemName }

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
        const body = editingItem
          ? { siteId: editingItem.id, name: newItemName, code: newItemCode }
          : { name: newItemName, code: newItemCode }

        const response = await fetch(`/api/companies/${editingCompanyId}/sites`, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        if (!response.ok) throw new Error('Failed to save')
        
        const result = await response.json()
        setCompanies(prev => prev.map(c => c.id === editingCompanyId ? { ...c, sites: editingItem ? c.sites.map(s => s.id === editingItem.id ? { id: s.id, name: newItemName, code: newItemCode } : s) : [...c.sites, { id: result.id, name: result.name, code: result.code }] } : c))
        toast({ title: 'Success', description: editingItem ? 'Site updated' : 'Site added' })
      }

      setIsDialogOpen(false)
      setEditingItem(null)
      setNewItemName('')
      setNewItemCode('')
      setEditingCompanyId('')
      setEditingType('')
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingItem(null)
    setNewItemName('')
    setNewItemCode('')
    setEditingCompanyId('')
    setEditingType('')
  }

  if (isLoading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Management Client</h1>
        <Button onClick={handleAddCompany} className="gap-2 bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          <span>Add Company</span>
        </Button>
      </div>

      {/* Search Filter */}
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
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
                <button className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4 flex-1 text-left">
                    <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                    <Badge variant="outline" className="h-10 w-10 flex items-center justify-center rounded-full font-semibold flex-shrink-0 text-xs">
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
                {/* Company Actions */}
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
                      <DropdownMenuItem onClick={() => handleEditCompany(company)} className="cursor-pointer">
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteCompany(company.id)} className="cursor-pointer text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Sites List */}
                {company.sites.length > 0 ? (
                  <div className="space-y-2">
                    {company.sites.map((site) => (
                      <div key={site.id} className="flex items-center justify-between rounded-lg border border-border bg-background p-3 hover:bg-muted transition-colors group">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Badge variant="outline" className="h-8 w-8 flex items-center justify-center rounded-full font-semibold flex-shrink-0 text-xs bg-muted">
                            {site.code}
                          </Badge>
                          <span className="text-sm text-foreground truncate">{site.name}</span>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-muted flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreVertical className="h-3 w-3 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditSite(company.id, site)} className="cursor-pointer">
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteSite(company.id, site.id)} className="cursor-pointer text-destructive">
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

      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
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
              <Label htmlFor="item-name">{editingType === 'company' ? 'Company' : 'Site'} Name</Label>
              <Input
                id="item-name"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder={`Enter ${editingType === 'company' ? 'company' : 'site'} name`}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveItem()}
              />
            </div>
            {editingType === 'site' && (
              <div className="space-y-2">
                <Label htmlFor="item-code">Site Code</Label>
                <Input
                  id="item-code"
                  value={newItemCode}
                  onChange={(e) => setNewItemCode(e.target.value.toUpperCase())}
                  placeholder="e.g., HOJ"
                  maxLength={3}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveItem()}
                />
              </div>
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

  const filteredCompanies = companies
    .map((company) => ({
      ...company,
      sites: company.sites.filter((site) =>
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
        const body = editingItem
          ? { id: editingItem.id, name: newItemName }
          : { name: newItemName }

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
        const body = editingItem
          ? { siteId: editingItem.id, name: newItemName, code: newItemCode }
          : { name: newItemName, code: newItemCode }

        const response = await fetch(`/api/companies/${editingCompanyId}/sites`, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        if (!response.ok) throw new Error('Failed to save')
        
        const result = await response.json()
        setCompanies(prev => prev.map(c => c.id === editingCompanyId ? { ...c, sites: editingItem ? c.sites.map(s => s.id === editingItem.id ? { id: s.id, name: newItemName, code: newItemCode } : s) : [...c.sites, { id: result.id, name: result.name, code: result.code }] } : c))
        toast({ title: 'Success', description: editingItem ? 'Site updated' : 'Site added' })
      }

      setIsDialogOpen(false)
      setEditingItem(null)
      setNewItemName('')
      setNewItemCode('')
      setEditingCompanyId('')
      setEditingType('')
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingItem(null)
    setNewItemName('')
    setNewItemCode('')
    setEditingCompanyId('')
    setEditingType('')
  }

  if (isLoading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Management Client</h1>
        <Button onClick={handleAddCompany} className="gap-2 bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          <span>Add Company</span>
        </Button>
      </div>

      {/* Search Filter */}
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
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
                <button className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4 flex-1 text-left">
                    <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                    <Badge variant="outline" className="h-10 w-10 flex items-center justify-center rounded-full font-semibold flex-shrink-0 text-xs">
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
                {/* Company Actions */}
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
                      <DropdownMenuItem onClick={() => handleEditCompany(company)} className="cursor-pointer">
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteCompany(company.id)} className="cursor-pointer text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Sites List */}
                {company.sites.length > 0 ? (
                  <div className="space-y-2">
                    {company.sites.map((site) => (
                      <div key={site.id} className="flex items-center justify-between rounded-lg border border-border bg-background p-3 hover:bg-muted transition-colors group">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Badge variant="outline" className="h-8 w-8 flex items-center justify-center rounded-full font-semibold flex-shrink-0 text-xs bg-muted">
                            {site.code}
                          </Badge>
                          <span className="text-sm text-foreground truncate">{site.name}</span>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-muted flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreVertical className="h-3 w-3 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditSite(company.id, site)} className="cursor-pointer">
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteSite(company.id, site.id)} className="cursor-pointer text-destructive">
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

      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
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
              <Label htmlFor="item-name">{editingType === 'company' ? 'Company' : 'Site'} Name</Label>
              <Input
                id="item-name"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder={`Enter ${editingType === 'company' ? 'company' : 'site'} name`}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveItem()}
              />
            </div>
            {editingType === 'site' && (
              <div className="space-y-2">
                <Label htmlFor="item-code">Site Code</Label>
                <Input
                  id="item-code"
                  value={newItemCode}
                  onChange={(e) => setNewItemCode(e.target.value.toUpperCase())}
                  placeholder="e.g., HOJ"
                  maxLength={3}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveItem()}
                />
              </div>
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
