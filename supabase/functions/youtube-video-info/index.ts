import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface YouTubeVideoInfo {
  title: string;
  author: string;
  thumbnailUrl: string;
  durationMinutes: number | null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoUrl } = await req.json();

    if (!videoUrl) {
      return new Response(
        JSON.stringify({ error: 'videoUrl is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const videoId = extractYouTubeVideoId(videoUrl);
    
    if (!videoId) {
      return new Response(
        JSON.stringify({ error: 'Invalid YouTube URL' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching info for YouTube video: ${videoId}`);

    // Get basic info from oEmbed API
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const oembedResponse = await fetch(oembedUrl);
    
    if (!oembedResponse.ok) {
      return new Response(
        JSON.stringify({ error: 'Could not fetch video info' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const oembedData = await oembedResponse.json();
    
    // Get best available thumbnail with fallback
    const thumbnailUrl = await getBestThumbnail(videoId);
    console.log(`Best thumbnail found: ${thumbnailUrl}`);
    
    // Try to get duration from Invidious API
    let durationMinutes: number | null = null;
    
    const invidiousInstances = [
      'https://vid.puffyan.us',
      'https://invidious.snopyta.org',
      'https://yewtu.be',
      'https://invidious.kavin.rocks'
    ];
    
    for (const instance of invidiousInstances) {
      try {
        const invidiousUrl = `${instance}/api/v1/videos/${videoId}?fields=lengthSeconds`;
        console.log(`Trying Invidious: ${invidiousUrl}`);
        
        const invidiousResponse = await fetch(invidiousUrl, {
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(5000)
        });
        
        if (invidiousResponse.ok) {
          const data = await invidiousResponse.json();
          if (data.lengthSeconds) {
            durationMinutes = Math.ceil(data.lengthSeconds / 60);
            console.log(`Duration from Invidious: ${durationMinutes} minutes`);
            break;
          }
        }
      } catch (error) {
        console.log(`Invidious instance ${instance} failed:`, error);
        continue;
      }
    }

    const result: YouTubeVideoInfo = {
      title: oembedData.title,
      author: oembedData.author_name,
      thumbnailUrl,
      durationMinutes,
    };

    console.log('Video info:', result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in youtube-video-info:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function getBestThumbnail(videoId: string): Promise<string> {
  const thumbnailOptions = [
    `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    `https://img.youtube.com/vi/${videoId}/sddefault.jpg`,
    `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
  ];

  for (const url of thumbnailOptions) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      // Check if image exists and is not the default placeholder (120 bytes)
      const contentLength = response.headers.get('content-length');
      if (response.ok && contentLength && parseInt(contentLength) > 1000) {
        return url;
      }
    } catch {
      continue;
    }
  }

  // Return the most reliable fallback
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}
