import { env } from '@/src/env';

interface Props {
  exerciseName: string;
}

export default async function VideoComponent({ exerciseName }: Props) {
  const src = await getVideoSrc(exerciseName);
  return (
    <div className="flex justify-center items-center w-full">
      <iframe 
        width="560"
        height="315"
        src={src}
        allowFullScreen
        className="rounded-lg shadow-lg"
      />
    </div>
  );
}

async function getVideoSrc(exerciseName: string): Promise<string> {
  // Add fitness-specific terms to narrow down results
  const searchQuery = `${exerciseName} workout exercise proper form demonstration`;
  const apiKey = env.YOUTUBE_API_KEY;
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&key=${apiKey}&maxResults=1&type=video&order=relevance&videoCategoryId=17&regionCode=US`;


  try {
    const response = await fetch(url, {
      cache: 'no-store', // Disable caching
      next: { revalidate: 0 } // Force revalidation on each request
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch video');
    }

    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      const videoId = data.items[0].id.videoId;
      return `https://www.youtube.com/embed/${videoId}?rel=0`;
    }
    
    return "https://www.youtube.com/watch?v=bZq2D3kdwdY";
  } catch (error) {
    console.error('Error fetching YouTube video:', error);
    return "https://www.youtube.com/watch?v=bZq2D3kdwdY";
  }
}
