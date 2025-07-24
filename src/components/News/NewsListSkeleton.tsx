import { motion } from 'framer-motion'

export default function NewsListSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-lg">
        <div className="p-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-2xl shimmer"></div>
            <div className="space-y-2">
              <div className="h-8 w-32 bg-gray-300 dark:bg-gray-600 rounded shimmer"></div>
              <div className="h-4 w-48 bg-gray-300 dark:bg-gray-600 rounded shimmer"></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full bg-gray-300 dark:bg-gray-600 rounded shimmer"></div>
            <div className="h-4 w-3/4 bg-gray-300 dark:bg-gray-600 rounded shimmer"></div>
          </div>
        </div>
      </div>

      {/* Filters Skeleton */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded-full shimmer"
            />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded shimmer"></div>
            <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded shimmer"></div>
          </div>
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded shimmer"></div>
        </div>
      </div>

      {/* News Cards Skeleton */}
      {Array.from({ length: 3 }).map((_, groupIndex) => (
        <motion.div
          key={groupIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: groupIndex * 0.1 }}
          className="space-y-4"
        >
          {/* Date Header Skeleton */}
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            <div className="h-6 w-20 bg-gray-300 dark:bg-gray-600 rounded shimmer"></div>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
            <div className="h-4 w-8 bg-gray-300 dark:bg-gray-600 rounded shimmer"></div>
          </div>

          {/* News Items Skeleton */}
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, cardIndex) => (
              <motion.div
                key={cardIndex}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (groupIndex * 4 + cardIndex) * 0.05 }}
                className="card p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Category and time */}
                    <div className="flex items-center space-x-3">
                      <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full shimmer"></div>
                      <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded shimmer"></div>
                      <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded shimmer"></div>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                      <div className="h-5 w-full bg-gray-200 dark:bg-gray-700 rounded shimmer"></div>
                      <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded shimmer"></div>
                    </div>

                    {/* Summary */}
                    <div className="space-y-2">
                      <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded shimmer"></div>
                      <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded shimmer"></div>
                    </div>

                    {/* Tags */}
                    <div className="flex space-x-2">
                      {Array.from({ length: 3 }).map((_, tagIndex) => (
                        <div
                          key={tagIndex}
                          className="h-6 w-12 bg-gray-200 dark:bg-gray-700 rounded-full shimmer"
                        />
                      ))}
                    </div>

                    {/* Source */}
                    <div className="flex items-center justify-between">
                      <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded shimmer"></div>
                      <div className="flex space-x-2">
                        <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded shimmer"></div>
                        <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded shimmer"></div>
                      </div>
                    </div>
                  </div>

                  {/* Favorite button */}
                  <div className="ml-4 w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-full shimmer"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  )
}