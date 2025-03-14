import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import Layout from "@/components/Layout";
import { Video, Category } from "@shared/schema";
import VideoCard from "@/components/VideoCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function CategoryPage() {
  const { categorySlug } = useParams();
  
  // Mapear slug a tipo de categoría real
  let categoryType = "all";
  let categoryTitle = "Todos los videos";
  let categoryIcon = "";
  
  switch(categorySlug) {
    case "matches":
      categoryType = "matches";
      categoryTitle = "Partidos";
      categoryIcon = "fas fa-futbol";
      break;
    case "analysis":
      categoryType = "analysis";
      categoryTitle = "Análisis";
      categoryIcon = "fas fa-comments";
      break;
    case "historic":
      categoryType = "press"; // Usamos 'press' como equivalente a momentos históricos
      categoryTitle = "Momentos Históricos";
      categoryIcon = "fas fa-trophy";
      break;
    case "players":
      categoryType = "players";
      categoryTitle = "Jugadores";
      categoryIcon = "fas fa-user";
      break;
    case "press":
      categoryType = "press";
      categoryTitle = "Noticias";
      categoryIcon = "fas fa-newspaper";
      break;
    default:
      categoryType = "all";
      categoryTitle = "Todos los Videos";
      categoryIcon = "fas fa-film";
  }

  // Fetch videos filtered by category
  const { data: videos = [], isLoading } = useQuery<Video[]>({
    queryKey: ['/api/videos', { category: categoryType }],
  });

  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8 border-b border-[#FDBE11] pb-4">
          <i className={`${categoryIcon} text-2xl text-[#FDBE11] mr-3`}></i>
          <h1 className="text-2xl font-bold text-[#001C58]">{categoryTitle}</h1>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, index) => (
              <div key={index} className="flex flex-col">
                <Skeleton className="h-48 w-full mb-3 rounded-md" />
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <i className="fas fa-video-slash text-4xl text-gray-400 mb-4"></i>
            <p className="text-gray-600 text-lg">
              No hay videos disponibles en esta categoría.
            </p>
            <p className="text-gray-500 mt-2">
              Estamos trabajando para añadir más contenido pronto.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}