import { getJson } from 'serpapi';

interface EducationalResource {
  title: string;
  link: string;
  type: 'video' | 'article';
  description?: string;
}

export async function searchEducationalContent(topic: string): Promise<EducationalResource[]> {
  const apiKey = '2127272233d7915fe37c41b0f0cf8bfe28feb8898747ec0e5c79cdfe7f1afc7e';

  try {
    // Search for YouTube videos
    const videoResults = await getJson({
      engine: "youtube",
      search_query: `${topic} cybersecurity tutorial`,
      api_key: apiKey
    });

    // Search for articles
    const articleResults = await getJson({
      engine: "google",
      q: `${topic} cybersecurity guide tutorial`,
      api_key: apiKey
    });

    const resources: EducationalResource[] = [];

    // Process video results
    if (videoResults.video_results) {
      videoResults.video_results.slice(0, 3).forEach((video: any) => {
        resources.push({
          title: video.title,
          link: video.link,
          type: 'video',
          description: video.description
        });
      });
    }

    // Process article results
    if (articleResults.organic_results) {
      articleResults.organic_results.slice(0, 3).forEach((article: any) => {
        resources.push({
          title: article.title,
          link: article.link,
          type: 'article',
          description: article.snippet
        });
      });
    }

    return resources;
  } catch (error) {
    console.error('Error searching educational content:', error);
    return [];
  }
}

export function analyzeMistake(userAction: string): string {
  const mistakes = {
    'phishing': 'phishing awareness',
    'password': 'password security',
    'malware': 'malware detection',
    'social engineering': 'social engineering prevention',
    'wifi': 'wireless security',
    'email': 'email security'
  };

  const action = userAction.toLowerCase();
  for (const [key, topic] of Object.entries(mistakes)) {
    if (action.includes(key)) {
      return topic;
    }
  }
  
  return 'general cybersecurity';
}