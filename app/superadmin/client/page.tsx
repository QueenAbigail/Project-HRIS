'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { Plus, MoreVertical, Pencil, Trash2, ChevronDown } from 'lucide-react'

// Types
interface Site {
  id: string
  name: string
  abbreviation: string
}

interface Company {
  id: string
  name: string
  abbreviation: string
  sites: Site[]
}

export default function ClientPage() {
  const [companies, setCompanies] = useState<Company[]>([
    {
      id: '1',
      name: 'PT Rajawali Indonesia',
      abbreviation: 'PRI',
      sites: [
        { id: '1-1', name: 'Head Office Jakarta', abbreviation: 'HOJ' },
        { id: '1-2', name: 'Warehouse Tangerang', abbreviation: 'WT' },
      ],
    },
    {
      id: '2',
      name: 'PT Global Services',
      abbreviation: 'PGS',
      sites: [
        { id: '2-1', name: 'Main Office', abbreviation: 'MO' },
        { id: '2-2', name: 'Branch Surabaya', abbreviation: 'BS' },
        { id: '2-3', name: 'Service Center Bandung', abbreviation: 'SCB' },
      ],
    },
  ])

  const [editingItem, setEditingItem] = useState<Company | Site | null>(null)
  const [editingCompanyId, setEditingCompanyId] = useState<string>('')
  const [editingType, setEditingType] = useState<'company' | 'site' | ''>('')
  const [newItemName, setNewItemName] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

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
    setEditingCompanyId(companyId)
    setIsDialogOpen(true)
  }

  const handleDeleteCompany = (companyId: string) => {
    setCompanies((prev) => prev.filter((company) => company.id !== companyId))
  }

  const handleDeleteSite = (companyId: string, siteId: string) => {
    setCompanies((prev) =>
      prev.map((company) =>
        company.id === companyId
          ? { ...company, sites: company.sites.filter((site) => site.id !== siteId) }
          : company
      )
    )
  }

  const handleSaveItem = () => {
    if (!newItemName.trim()) return

    if (editingType === 'company') {
      const newAbbr = newItemName
        .split(' ')
        .map((word) => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 3)

      if (editingItem && 'sites' in editingItem) {
        setCompanies((prev) =>
          prev.map((company) =>
            company.id === editingItem.id ? { ...company, name: newItemName, abbreviation: newAbbr } : company
          )
        )
      } else {
        const newCompany: Company = {
          id: Date.now().toString(),
          name: newItemName,
          abbreviation: newAbbr,
          sites: [],
        }
        setCompanies((prev) => [...prev, newCompany])
      }
    } else if (editingType === 'site') {
      const newAbbr = newItemName
        .split(' ')
        .map((word) => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 3)

      if (editingItem && !('sites' in editingItem)) {
        setCompanies((prev) =>
          prev.map((company) =>
            company.id === editingCompanyId
              ? {
                  ...company,
                  sites: company.sites.map((site) =>
                    site.id === editingItem.id ? { ...site, name: newItemName, abbreviation: newAbbr } : site
                  ),
                }
              : company
          )
        )
      } else {
        const newSite: Site = {
          id: Date.now().toString(),
          name: newItemName,
          abbreviation: newAbbr,
        }
        setCompanies((prev) =>
          prev.map((company) =>
            company.id === editingCompanyId ? { ...company, sites: [...company.sites, newSite] } : company
          )
        )
      }
    }

    setIsDialogOpen(false)
    setEditingItem(null)
    setNewItemName('')
    setEditingCompanyId('')
    setEditingType('')
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingItem(null)
    setNewItemName('')
    setEditingCompanyId('')
    setEditingType('')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Management Client</h1>
        <Button onClick={handleAddCompany} className="gap-2 bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          <span>Add Company</span>
        </Button>
      </div>

      <div className="space-y-3">
        {companies.length > 0 ? (
          companies.map((company) => (
            <Collapsible key={company.id} className="border border-border rounded-lg bg-card">
              <CollapsibleTrigger asChild>
                <button className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4 flex-1 text-left">
                    <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                    <Badge variant="outline" className="h-10 w-10 flex items-center justify-center rounded-full font-semibold flex-shrink-0">
                      {company.abbreviation}
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
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleAddSite(company.id)}
                  >
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
                      <div
                        key={site.id}
                        className="flex items-center justify-between rounded-lg border border-border bg-background p-3 hover:bg-muted transition-colors group"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Badge variant="outline" className="h-8 w-8 flex items-center justify-center rounded-full font-semibold flex-shrink-0 text-xs bg-muted">
                            {site.abbreviation}
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
            <p className="text-muted-foreground mb-4">No companies yet</p>
            <Button onClick={handleAddCompany} className="gap-2">
              <Plus className="h-4 w-4" />
              Add First Company
            </Button>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingType === 'company'
                ? editingItem && 'sites' in editingItem
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
            <Button onClick={handleSaveItem} className="w-full">
              {editingItem ? 'Update' : 'Add'} {editingType === 'company' ? 'Company' : 'Site'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
