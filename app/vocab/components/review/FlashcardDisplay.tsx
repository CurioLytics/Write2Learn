// 'use client'

// import { useState } from 'react'
// import { Card } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import type { VocabCard } from '@/types/vocab'

// interface FlashcardDisplayProps {
//   card: VocabCard
// }

// export function FlashcardDisplay({ card }: FlashcardDisplayProps) {
//   const [isFlipped, setIsFlipped] = useState(false)

//   return (
//     <div className="w-full max-w-2xl mx-auto my-8">
//       <Card 
//         className={`p-8 min-h-[200px] cursor-pointer transition-all duration-300 ${
//           isFlipped ? 'bg-gray-50' : 'bg-white'
//         }`}
//         onClick={() => setIsFlipped(!isFlipped)}
//       >
//         <div className="flex flex-col items-center justify-center text-center">
//           {!isFlipped ? (
//             <div>
//               <h3 className="text-2xl font-bold mb-4">{card.word}</h3>
//               {card.example && (
//                 <p className="text-gray-600 italic">{card.example}</p>
//               )}
//             </div>
//           ) : (
//             <div>
//               <h4 className="text-xl mb-2 text-gray-700">{card.word}</h4>
//               <p className="text-2xl font-bold mb-4">{card.meaning}</p>
//               {card.example && (
//                 <p className="text-gray-600 italic">{card.example}</p>
//               )}
//             </div>
//           )}
//         </div>
//       </Card>
      
//       <Button
//         variant="ghost"
//         className="w-full mt-4"
//         onClick={() => setIsFlipped(!isFlipped)}
//       >
//         {isFlipped ? '← Show Word' : 'Show Meaning →'}
//       </Button>
//     </div>
//   )
// }