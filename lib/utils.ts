import { type ClassValue, clsx } from 'clsx'
import { Metadata } from 'next'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function absoluteUrl(path: string) {
  if (typeof window !== 'undefined') return path
  if (process.env.VERCEL_URL)
    return `https://${process.env.VERCEL_URL}${path}`
  return `http://localhost:${
    process.env.PORT ?? 3000
  }${path}`
}

export function constructMetadata({
  title = "Nexus | Unlock Insights with AI-Powered PDF Analysis",
  description = "Nexus is a cutting-edge platform that leverages advanced AI to transform how you engage with PDF documents. Designed for efficiency and accuracy, Nexus reads, analyzes, and extracts key insights from your PDFs, providing detailed summaries, actionable takeaways, and contextual understanding in a matter of seconds. Whether you're working with research papers, business reports, or legal documents, Nexus streamlines the process of sifting through content, allowing you to focus on what truly matters. With its AI-powered analysis, Nexus makes navigating complex information faster and smarter than ever before.",
  image = "/thumbnail.png",
  icons = "/favicon.ico",
  noIndex = false
}: {
  title?: string
  description?: string
  image?: string
  icons?: string
  noIndex?: boolean
} = {}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: image
        }
      ]
    },
    icons,
    metadataBase: new URL('https://nexus-ai-lab.vercel.app'),
    ...(noIndex && {
      robots: {
        index: false,
        follow: false
      }
    })
  }
}
