interface LinkedInJobData {
  jobId: string
  description: string
}

export const extractJobIdFromUrl = (url: string): string | null => {
  const match = url.match(/\/jobs\/view\/(\d+)/)
  return match ? match[1] : null
}

export const scrapeLinkedInJob = async (jobId: string | null): Promise<LinkedInJobData | null> => {
  try {
    const apiUrl = `https://linkedin-job-scrapper.ashu2singh1.workers.dev/scrape?jobId=${jobId}`;
    const response = await fetch(apiUrl);

    const data = await response.json();

    if (!response.ok) {
      // If the API sends error details in the response body
      const errorMessage = data?.error || `Failed to fetch: ${response.status}`;
      throw new Error(errorMessage);
    }

    if (!data.description || data.description.length < 5) {
      throw new Error('Job Description is missing or too short');
    }

    if(!jobId){
      throw new Error(`Please provide a valid LinkedIn job link with a job ID.`)
    }

    return {
      jobId,
      description: data.description.trim()
    };
  } catch (error: any) {
    console.error('Error using LinkedIn Scraper API:', error);
    // Rethrow the exact message from the API or a generic fallback
    throw new Error(error.message || 'JobId is invalid or Something Went Wrong!!');
  }
};
