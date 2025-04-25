'use client'

import { Card } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Welcome</h1>
        <p className="text-gray-600">Your application is now working correctly.</p>
      </Card>
    </div>
  )
}