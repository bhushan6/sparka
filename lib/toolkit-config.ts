export const TOOLKIT_AUTH_CONFIG: Record<string, string | undefined> = {
  GOOGLECALENDAR: process.env.GOOGLECALENDAR_AUTH_ID,
  GMAIL: process.env.GMAIL_AUTH_ID,
  GOOGLEDOCS: process.env.GOOGLEDOCS_AUTH_ID,
  GITHUB: process.env.GITHUB_AUTH_ID,
} as const;
