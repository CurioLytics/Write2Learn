// 'use client'

// import { useEffect, useState } from 'react'
// import { Card } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { useRouter } from 'next/navigation'
// import type { ReviewLog } from '@/types/vocab'

// interface ReviewSummaryProps {
//   logs: ReviewLog[]
// }

// export function ReviewSummary({ logs }: ReviewSummaryProps) {
//   const router = useRouter()
//   const [stats, setStats] = useState({
//     total: logs.length,
//     again: 0,
//     hard: 0,
//     good: 0,
//     easy: 0
//   })

//   useEffect(() => {
//     const newStats = logs.reduce((acc, log) => {
//       acc[log.rating.toLowerCase()]++
//       return acc
//     }, {
//       total: logs.length,
//       again: 0,
//       hard: 0,
//       good: 0,
//       easy: 0
//     })
//     setStats(newStats)
//   }, [logs])

//   return (
//     <Card className="p-8 max-w-2xl mx-auto">
//       <h2 className="text-2xl font-bold mb-6">Review Complete! 🎉</h2>
      
//       <div className="grid grid-cols-2 gap-4 mb-8">
//         <div className="bg-gray-50 p-4 rounded">
//           <h3 className="font-medium text-gray-700">Total Cards</h3>
//           <p className="text-2xl font-bold">{stats.total}</p>
//         </div>
        
//         <div className="bg-blue-50 p-4 rounded">
//           <h3 className="font-medium text-blue-700">Easy</h3>
//           <p className="text-2xl font-bold text-blue-600">{stats.easy}</p>
//         </div>
        
//         <div className="bg-green-50 p-4 rounded">
//           <h3 className="font-medium text-green-700">Good</h3>
//           <p className="text-2xl font-bold text-green-600">{stats.good}</p>
//         </div>
        
//         <div className="bg-yellow-50 p-4 rounded">
//           <h3 className="font-medium text-yellow-700">Hard</h3>
//           <p className="text-2xl font-bold text-yellow-600">{stats.hard}</p>
//         </div>
//       </div>

//       <div className="flex justify-between">
//         <Button 
//           variant="outline"
//           onClick={() => router.push('/vocab')}
//         >
//           Back to Sets
//         </Button>
        
//         <Button
//           onClick={() => router.refresh()}
//         >
//           Review Again
//         </Button>
//       </div>
//     </Card>
//   )
// }