'use client'

import { PhantomSkeleton } from '@/components/phantom-skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function PrintQRCodeLoading() {
  return (
    <PhantomSkeleton loading={true} animation="shimmer">
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <h1 className="h-10 w-1/3 text-3xl font-bold">QR Code Generator</h1>
          <p className="h-4 w-2/3 text-muted-foreground">Generate and print QR codes</p>
        </div>

        {/* Filters Card */}
        <Card>
          <CardHeader>
            <div className="h-6 w-20 font-semibold">Options</div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select className="h-10 w-full rounded-md"><option>Type</option></select>
              <input className="h-10 w-full rounded-md" placeholder="Value" />
              <button className="h-10 w-full rounded-md">Generate</button>
            </div>
          </CardContent>
        </Card>

        {/* QR Codes Grid */}
        <Card>
          <CardHeader>
            <div className="h-6 w-1/4 font-semibold">Generated QR Codes</div>
          </CardHeader>
          <CardContent className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 w-full border border-border rounded-lg flex items-center justify-between p-3">
                <div className="h-4 w-24">QR Code {i}</div>
                <button className="h-8 w-20 rounded-md">Print</button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PhantomSkeleton>
  )
}
