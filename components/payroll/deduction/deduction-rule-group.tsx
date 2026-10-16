'use client'

import { Edit2, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { type DeductionRule, deductionTypeGroups } from './types'

function formatValue(rule: DeductionRule) { return rule.deductionType === 'percentage' ? `${rule.value}%` : `Rp ${rule.value.toLocaleString('id-ID')}` }
export function DeductionRuleGroup({ group, rules, onEdit, onDeactivate }: { group: (typeof deductionTypeGroups)[number]; rules: DeductionRule[]; onEdit: (rule: DeductionRule) => void; onDeactivate: (rule: DeductionRule) => void }) {
  return <section className="overflow-hidden rounded-lg border"><div className="flex items-start justify-between border-b bg-muted/30 px-6 py-4"><div><h2 className={`text-lg font-semibold ${group.color}`}>{group.name}</h2><p className="mt-1 text-sm text-muted-foreground">{group.description}</p></div><Badge variant="secondary">{rules.length} rule{rules.length !== 1 ? 's' : ''}</Badge></div><Table><TableHeader><TableRow><TableHead>Deduction Name</TableHead><TableHead>Calculation</TableHead><TableHead className="text-right">Value</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{rules.map((rule) => <TableRow key={rule.id}><TableCell className="font-medium">{rule.name}</TableCell><TableCell><Badge variant="outline">{rule.deductionType === 'percentage' ? 'Percentage' : 'Fixed'}</Badge></TableCell><TableCell className="text-right font-medium">{formatValue(rule)}</TableCell><TableCell><Badge variant={rule.status === 'active' ? 'default' : 'secondary'}>{rule.status}</Badge></TableCell><TableCell className="text-right"><div className="flex justify-end gap-2"><Button variant="ghost" size="icon" aria-label={`Edit ${rule.name}`} onClick={() => onEdit(rule)}><Edit2 className="h-4 w-4" /></Button>{rule.status === 'active' && <Button variant="ghost" size="icon" aria-label={`Deactivate ${rule.name}`} onClick={() => onDeactivate(rule)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}</div></TableCell></TableRow>)}</TableBody></Table></section>
}
