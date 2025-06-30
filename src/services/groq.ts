import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true
})

export const generateJobTags = async (jobDescription: string): Promise<string[]> => {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert recruiter and job analyst. Your task is to extract 8 to 12 of the most relevant one-word tags from a job description.
          Only return a comma-separated list of one-word tags. Do NOT include any extra text, formatting, or multi-word phrases.
          While analyzing the job description, focus on what the company is looking for in a candidate — NOT what the company is doing or working on as part of their business.
          Do not keep - (Here are the relevant tags extracted from the job description:) in the response.
          Extract the following types of tags:
          - Technical skills and programming languages
          - Tools, platforms, and frameworks
          - Job titles or roles
          - Certifications and degrees
          - Industry-specific terms
          - Experience requirements (e.g., "5+ years experience")
          - Location (default to "India" if not explicitly mentioned in the description)`
        },
        {
          role: "user",
          content: `Extract relevant tags from this job description:\n\n${jobDescription}`
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 200
    })

    const response = completion.choices[0]?.message?.content || ""
    const tags = response
      .split(',')
      .map(tag => tag.trim().replace(/['"]/g, ''))
      .filter(tag => tag.length > 0)

    return tags
  } catch (error) {
    console.error('Error generating tags with Groq:', error)
    throw new Error('Failed to generate job tags. Please try again.')
  }
}
