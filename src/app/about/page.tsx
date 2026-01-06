'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AboutPage() {
  return (
    <div className="container mx-auto p-8">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Shadcn Demo</CardTitle>
          <CardDescription>Button and Card components</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => console.log('clicked')}>
            Test Button
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
// export default function AboutPage() {
//   return (
//     <div>
//       <h1>About Page</h1>
//     </div>
//   )
// }