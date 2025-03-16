import { Skeleton } from "@/components/ui/skeleton";

interface LoadingVideosProps {
  count?: number;
  compact?: boolean;
}

export default function LoadingVideos({ count = 8, compact = false }: LoadingVideosProps) {
  const skeletons = Array.from({ length: count }, (_, i) => i);

  if (compact) {
    return (
      <div className="space-y-4">
        {skeletons.map((i) => (
          <div key={i} className="flex bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 h-24">
            <div className="w-1/3 relative">
              <Skeleton className="w-full h-full" />
            </div>
            <div className="p-3 w-2/3 space-y-2">
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex justify-between items-center mt-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {skeletons.map((i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Skeleton className="w-full aspect-video" />
            <div className="absolute bottom-2 right-2">
              <Skeleton className="h-4 w-12 rounded" />
            </div>
            <div className="absolute top-2 left-2">
              <Skeleton className="h-5 w-24 rounded" />
            </div>
          </div>
          <div className="p-3 space-y-2">
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex justify-between items-center mt-2">
              <div className="flex items-center">
                <Skeleton className="w-6 h-6 rounded-full mr-2" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
            <Skeleton className="h-3 w-40 mt-1" />
          </div>
        </div>
      ))}
    </div>
  );
}