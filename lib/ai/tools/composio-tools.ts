// import { tool } from "ai";
// import { z } from "zod";
// const executeComposioTool = async (
//   slug: string,
//   params: unknown,
//   userid: string,
// ) => {
//   console.log(`Executing tool: ${slug} with params:`, params);
//   const url = `https://backend.composio.dev/api/v3/tools/execute/${slug}`;
//   const options = {
//     method: "POST",
//     headers: {
//       "x-api-key": process.env.COMPOSIO_API_KEY,
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       arguments: params,
//       user_id: userid,
//     }),
//   };

//   try {
//     const response = await fetch(url, options);
//     if (!response.ok) {
//       const errorBody = await response.text();
//       console.error(
//         `Error executing tool ${slug}. Status: ${response.status}. Body: ${errorBody}`,
//       );
//       return {
//         successful: false,
//         error: `API request failed with status ${response.status}`,
//       };
//     }
//     const data = await response.json();
//     console.log(`Execution result for ${slug}:`, data);
//     return data;
//   } catch (error) {
//     console.error(`Error executing tool ${slug}:`, error);
//     //@ts-expect-error: error inknown type
//     return { successful: false, error: error.message };
//   }
// };

// export const createCalendarTool = (userId: string) => {
//   return tool({
//     description: `Creates an event on a google calendar, needing rfc3339 utc start/end times (end after start) and write access to the calendar. by default, adds the organizer as an attendee unless exclude organizer is set to true.`,
//     inputSchema: z.object({
//       attendees: z
//         .array(z.string())
//         .describe("List of attendee emails (strings).")
//         .optional()
//         .nullable(),
//       calendar_id: z
//         .string()
//         .describe(
//           "Target calendar: 'primary' for the user's main calendar, or the calendar's email address.",
//         )
//         .optional(),
//       create_meeting_room: z
//         .boolean()
//         .describe(
//           "If true, a Google Meet link is created and added to the event. CRITICAL: As of 2024, this REQUIRES a paid Google Workspace account ($13+/month). Personal Gmail accounts will fail with 'Invalid conference type value' error. Solutions: 1) Upgrade to Workspace, 2) Use domain-wide delegation with Workspace user, 3) Use the new Google Meet REST API, or 4) Create events without conferences. See https://github.com/googleapis/google-api-nodejs-client/issues/3234",
//         )
//         .optional()
//         .nullable(),
//       description: z
//         .string()
//         .describe("Description of the event. Can contain HTML. Optional.")
//         .optional()
//         .nullable(),
//       eventType: z
//         .enum([
//           "birthday",
//           "default",
//           "focusTime",
//           "outOfOffice",
//           "workingLocation",
//         ])
//         .describe(
//           "Type of the event, immutable post-creation. Supported types: 'birthday' (all-day with annual recurrence), 'default' (regular event), 'focusTime' (focus-time event), 'outOfOffice' (out-of-office event), 'workingLocation' (working location event). Note: 'fromGmail' events cannot be created via API.",
//         )
//         .optional(),
//       event_duration_hour: z
//         .number()
//         .describe(
//           "Number of hours (0-24). Increase by 1 here rather than passing 60 in \`event_duration_minutes\`",
//         )
//         .optional(),
//       event_duration_minutes: z
//         .number()
//         .describe(
//           "Duration in minutes (0-59 ONLY). NEVER use 60+ minutes - use event_duration_hour=1 instead. Maximum value is 59.",
//         )
//         .optional(),
//       exclude_organizer: z
//         .boolean()
//         .describe(
//           "If True, the organizer will NOT be added as an attendee. Default is False (organizer is included).",
//         )
//         .optional(),
//       guestsCanInviteOthers: z
//         .boolean()
//         .describe(
//           "Whether attendees other than the organizer can invite others to the event.",
//         )
//         .optional()
//         .nullable(),
//       guestsCanSeeOtherGuests: z
//         .boolean()
//         .describe(
//           "Whether attendees other than the organizer can see who the event's attendees are.",
//         )
//         .optional()
//         .nullable(),
//       guests_can_modify: z
//         .boolean()
//         .describe("If True, guests can modify the event.")
//         .optional(),
//       location: z
//         .string()
//         .describe("Geographic location of the event as free-form text.")
//         .optional()
//         .nullable(),
//       recurrence: z
//         .array(z.string())
//         .describe(
//           "List of RRULE, EXRULE, RDATE, EXDATE lines for recurring events. Supported frequencies are DAILY, WEEKLY, MONTHLY, YEARLY.",
//         )
//         .optional()
//         .nullable(),
//       send_updates: z
//         .boolean()
//         .describe("Defaults to True. Whether to send updates to the attendees.")
//         .optional()
//         .nullable(),
//       start_datetime: z
//         .string()
//         .describe(
//           "Naive date/time (YYYY-MM-DDTHH:MM:SS) with NO offsets or Z. e.g. '2025-01-16T13:00:00'",
//         ),
//       summary: z
//         .string()
//         .describe("Summary (title) of the event.")
//         .optional()
//         .nullable(),
//       timezone: z
//         .string()
//         .describe(
//           "IANA timezone name (e.g., 'America/New_York'). Required if datetime is naive. If datetime includes timezone info (Z or offset), this field is optional and defaults to UTC.",
//         )
//         .optional()
//         .nullable(),
//       transparency: z
//         .enum(["opaque", "transparent"])
//         .describe("'opaque' (busy) or 'transparent' (available).")
//         .optional(),
//       visibility: z
//         .enum(["default", "public", "private", "confidential"])
//         .describe(
//           "Event visibility: 'default', 'public', 'private', or 'confidential'.",
//         )
//         .optional(),
//     }),
//     execute: async (params) =>
//       executeComposioTool("GOOGLECALENDAR_CREATE_EVENT", params, userId),
//   });
// };

// export const findEventTool = (userId: string) => {
//   return tool({
//     description: `Finds events in a specified google calendar using text query, time ranges (event start/end, last modification), and event types; ensure \`timemin\` is not chronologically after \`timemax\` if both are provided.`,
//     inputSchema: z.object({
//       calendar_id: z
//         .string()
//         .describe(
//           "Identifier of the Google Calendar to query. Use 'primary' for the primary calendar of the authenticated user, an email address for a specific user's calendar, or a calendar ID for other calendars.",
//         )
//         .optional(),
//       event_types: z
//         .array(
//           z.enum([
//             "birthday",
//             "default",
//             "focusTime",
//             "outOfOffice",
//             "workingLocation",
//           ]),
//         )
//         .describe(
//           "Event types to include: 'default' (regular event), 'focusTime' (focused work time), 'outOfOffice' (out-of-office time).",
//         )
//         .optional(),
//       max_results: z
//         .number()
//         .describe("Maximum number of events per page (1-2500).")
//         .optional(),
//       order_by: z
//         .string()
//         .describe(
//           "Order of events: 'startTime' (ascending by start time) or 'updated' (ascending by last modification time).",
//         )
//         .optional()
//         .nullable(),
//       page_token: z
//         .string()
//         .describe(
//           "Token from a previous response's \`nextPageToken\` to fetch the subsequent page of results.",
//         )
//         .optional()
//         .nullable(),
//       query: z
//         .string()
//         .describe(
//           "Free-text search terms to find events. This query is matched against various event fields including summary, description, location, attendees' details (displayName, email), and organizer's details.",
//         )
//         .optional()
//         .nullable(),
//       show_deleted: z
//         .boolean()
//         .describe("Include deleted events (status 'cancelled') in the result.")
//         .optional()
//         .nullable(),
//       single_events: z
//         .boolean()
//         .describe(
//           "Expand recurring events into individual instances. If false, returns master recurring events.",
//         )
//         .optional(),
//       timeMax: z
//         .string()
//         .describe(
//           `Upper bound (exclusive) for an event's start time to filter by. Only events starting before this time are included. Accepts multiple formats:
//     1. RFC3339 timestamp (e.g., '2024-12-06T13:00:00Z')
//     2. Comma-separated date/time parts (e.g., '2024,12,06,13,00,00')
//     3. Simple datetime string (e.g., '2024-12-06 13:00:00')`,
//         )
//         .optional()
//         .nullable(),
//       timeMin: z
//         .string()
//         .describe(
//           `Lower bound (exclusive) for an event's end time to filter by. Only events ending after this time are included. Accepts multiple formats:
//     1. RFC3339 timestamp (e.g., '2024-12-06T13:00:00Z')
//     2. Comma-separated date/time parts (e.g., '2024,12,06,13,00,00')
//     3. Simple datetime string (e.g., '2024-12-06 13:00:00')`,
//         )
//         .optional()
//         .nullable(),
//       updated_min: z
//         .string()
//         .describe(
//           `Lower bound (exclusive) for an event's last modification time to filter by. Only events updated after this time are included. When specified, events deleted since this time are also included, regardless of the \`show_deleted\` parameter. Accepts multiple formats:
//     1. RFC3339 timestamp (e.g., '2024-12-06T13:00:00Z')
//     2. Comma-separated date/time parts (e.g., '2024,12,06,13,00,00')
//     3. Simple datetime string (e.g., '2024-12-06 13:00:00')`,
//         )
//         .optional()
//         .nullable(),
//     }),
//     execute: async (params) =>
//       executeComposioTool("GOOGLECALENDAR_FIND_EVENT", params, userId),
//   });
// };

// export const findFreeSlotsTool = (userId: string) => {
//   return tool({
//     description: `Finds free/busy time slots in google calendars for specified calendars within a defined time range (defaults to the current day utc if \`time min\`/\`time max\` are omitted), enhancing busy intervals with event details; \`time min\` must precede \`time max\` if both are provided.`,
//     inputSchema: z.object({
//       calendar_expansion_max: z
//         .number()
//         .describe(
//           "Maximum calendars for which FreeBusy information is provided. Max allowed: 50.",
//         )
//         .optional(),
//       group_expansion_max: z
//         .number()
//         .describe(
//           "Maximum calendar identifiers to return for a single group; exceeding this causes an error. Max allowed: 100.",
//         )
//         .optional(),
//       items: z
//         .array(z.string())
//         .describe(
//           "List of calendar identifiers (primary ID 'primary', user/calendar email, or unique calendar ID) to query for free/busy information.",
//         )
//         .optional(),
//       time_max: z
//         .string()
//         .describe(
//           "End datetime for the query interval. Accepts ISO, comma-separated, or simple datetime formats.",
//         )
//         .optional()
//         .nullable(),
//       time_min: z
//         .string()
//         .describe(
//           "Start datetime for the query interval. Accepts ISO, comma-separated, or simple datetime formats.",
//         )
//         .optional()
//         .nullable(),
//       timezone: z
//         .string()
//         .describe(
//           "IANA timezone identifier (e.g., 'America/New_York', 'Europe/London') for interpreting \`time_min\` and \`time_max\` if they lack timezone info, and for expanding recurring events.",
//         )
//         .optional(),
//     }),
//     execute: async (params) =>
//       executeComposioTool("GOOGLECALENDAR_FIND_FREE_SLOTS", params, userId),
//   });
// };

// export const deleteEventTool = (userId: string) => {
//   return tool({
//     description: `Deletes a specified event by \`event id\` from a google calendar (\`calendar id\`); this action is idempotent and raises a 404 error if the event is not found.`,
//     inputSchema: z.object({
//       calendar_id: z
//         .string()
//         .describe(
//           "Identifier of the Google Calendar (e.g., email address, specific ID, or 'primary' for the authenticated user's main calendar) from which the event will be deleted.",
//         )
//         .optional(),
//       event_id: z
//         .string()
//         .describe(
//           "Unique identifier of the event to delete, typically obtained upon event creation.",
//         ),
//     }),
//     execute: async (params) =>
//       executeComposioTool("GOOGLECALENDAR_DELETE_EVENT", params, userId),
//   });
// };

// export const patchEventTool = (userId: string) => {
//   return tool({
//     description: `Updates specified fields of an existing event in a google calendar using patch semantics (array fields like \`attendees\` are fully replaced if provided); ensure the \`calendar id\` and \`event id\` are valid and the user has write access to the calendar.`,
//     inputSchema: z.object({
//       attendees: z
//         .array(z.string())
//         .describe(
//           "List of email addresses for attendees. Replaces existing attendees. Provide an empty list to remove all.",
//         )
//         .optional()
//         .nullable(),
//       calendar_id: z
//         .string()
//         .describe(
//           "Identifier of the calendar. Use 'primary' for the primary calendar of the logged-in user. To find other calendar IDs, use the \`calendarList.list\` method.",
//         ),
//       conference_data_version: z
//         .number()
//         .describe(
//           "API client's conference data support version. Set to 1 to manage conference details (e.g., Google Meet links); 0 (default) ignores conference data.",
//         )
//         .optional()
//         .nullable(),
//       description: z
//         .string()
//         .describe("New description for the event; can include HTML.")
//         .optional()
//         .nullable(),
//       end_time: z
//         .string()
//         .describe(
//           "New end time (RFC3339 timestamp, e.g., '2024-07-01T11:00:00-07:00'). Uses \`timezone\` if provided, otherwise UTC. For all-day events, use YYYY-MM-DD format (exclusive end date).",
//         )
//         .optional()
//         .nullable(),
//       event_id: z.string().describe("Identifier of the event to update."),
//       location: z
//         .string()
//         .describe(
//           "New geographic location (physical address or virtual meeting link).",
//         )
//         .optional()
//         .nullable(),
//       max_attendees: z
//         .number()
//         .describe(
//           "Maximum attendees in response; does not affect invited count. If more, response includes organizer only. Must be positive.",
//         )
//         .optional()
//         .nullable(),
//       rsvp_response: z
//         .string()
//         .describe(
//           "RSVP response status for the authenticated user. Updates only the current user's response status without affecting other attendees. Possible values: 'needsAction', 'declined', 'tentative', 'accepted'.",
//         )
//         .optional()
//         .nullable(),
//       send_updates: z
//         .string()
//         .describe(
//           "Whether to send update notifications to attendees: 'all', 'externalOnly', or 'none'. Uses default user behavior if unspecified.",
//         )
//         .optional()
//         .nullable(),
//       start_time: z
//         .string()
//         .describe(
//           "New start time (RFC3339 timestamp, e.g., '2024-07-01T10:00:00-07:00'). Uses \`timezone\` if provided, otherwise UTC. For all-day events, use YYYY-MM-DD format.",
//         )
//         .optional()
//         .nullable(),
//       summary: z
//         .string()
//         .describe("New title for the event.")
//         .optional()
//         .nullable(),
//       supports_attachments: z
//         .boolean()
//         .describe(
//           "Client application supports event attachments. Set to \`True\` if so.",
//         )
//         .optional()
//         .nullable(),
//       timezone: z
//         .string()
//         .describe(
//           "IANA Time Zone Database name for start/end times (e.g., 'America/Los_Angeles'). Used if \`start_time\` and \`end_time\` are provided and not all-day dates; defaults to UTC if unset.",
//         )
//         .optional()
//         .nullable(),
//     }),
//     execute: async (params) =>
//       executeComposioTool("GOOGLECALENDAR_PATCH_EVENT", params, userId),
//   });
// };

// export const createGoogleDocTool = (userId: string) => {
//   return tool({
//     description: `Creates a new google docs document using the provided title as filename and inserts the initial text at the beginning if non-empty, returning the document's id and metadata (excluding body content).`,
//     inputSchema: z.object({
//       text: z
//         .string()
//         .describe(
//           "Initial text content to insert at the beginning of the new document.",
//         ),
//       title: z
//         .string()
//         .describe(
//           "Title for the new document, used as its filename in Google Drive.",
//         ),
//     }),
//     execute: async (params) =>
//       executeComposioTool("GOOGLEDOCS_CREATE_DOCUMENT", params, userId),
//   });
// };

// export const searchDocTool = (userId: string) => {
//   return tool({
//     description: `Search for google documents using various filters including name, content, date ranges, and more.`,
//     inputSchema: z.object({
//       created_after: z
//         .string()
//         .describe(
//           "Return documents created after this date. Use RFC 3339 format like '2024-01-01T00:00:00Z'.",
//         )
//         .optional()
//         .nullable(),
//       include_trashed: z
//         .boolean()
//         .describe("Whether to include documents in trash. Defaults to False.")
//         .optional()
//         .nullable(),
//       max_results: z
//         .number()
//         .describe(
//           "Maximum number of documents to return (1-1000). Defaults to 10.",
//         )
//         .optional()
//         .nullable(),
//       modified_after: z
//         .string()
//         .describe(
//           "Return documents modified after this date. Use RFC 3339 format like '2024-01-01T00:00:00Z'.",
//         )
//         .optional()
//         .nullable(),
//       order_by: z
//         .string()
//         .describe(
//           "Order results by field. Common options: 'modifiedTime desc', 'modifiedTime asc', 'name', 'createdTime desc'",
//         )
//         .optional()
//         .nullable(),
//       query: z
//         .string()
//         .describe(
//           "Search query to filter documents. Can search by name (name contains 'report'), full text content (fullText contains 'important'), or use complex queries with operators like 'and', 'or', 'not'. Leave empty to get all documents.",
//         )
//         .optional()
//         .nullable(),
//       shared_with_me: z
//         .boolean()
//         .describe(
//           "Whether to return only documents shared with the current user. Defaults to False.",
//         )
//         .optional()
//         .nullable(),
//       starred_only: z
//         .boolean()
//         .describe(
//           "Whether to return only starred documents. Defaults to False.",
//         )
//         .optional()
//         .nullable(),
//     }),
//     execute: async (params) =>
//       executeComposioTool("GOOGLEDOCS_SEARCH_DOCUMENTS", params, userId),
//   });
// };

// export const replaceAllTexttool = (userId: string) => {
//   return tool({
//     description: `Tool to replace all occurrences of a specified text string with another text string throughout a google document. use when you need to perform a global find and replace operation within a document.`,
//     inputSchema: z.object({
//       document_id: z.string().describe("The ID of the document to update."),
//       find_text: z.string().describe("The text to search for in the document."),
//       match_case: z
//         .boolean()
//         .describe("Indicates whether the search should be case sensitive."),
//       replace_text: z
//         .string()
//         .describe("The text that will replace the matched text."),
//       search_by_regex: z
//         .boolean()
//         .describe(
//           "Optional. If True, the find_text is treated as a regular expression. Defaults to False.",
//         )
//         .optional()
//         .nullable(),
//       tab_ids: z
//         .array(z.string())
//         .describe(
//           "Optional. A list of specific tab IDs to perform the replacement on. If not provided, replacement occurs on all tabs.",
//         )
//         .optional()
//         .nullable(),
//     }),
//     execute: async (params) =>
//       executeComposioTool("GOOGLEDOCS_REPLACE_ALL_TEXT", params, userId),
//   });
// };

// export const insertTableTool = (userId: string) => {
//   return tool({
//     description: `Tool to insert a table into a google document. use when you need to add a new table at a specific location or at the end of a segment (like document body, header, or footer) in a document.`,
//     inputSchema: z.object({
//       columns: z.number().describe("The number of columns in the table."),
//       documentId: z.string().describe("The ID of the document to update."),
//       index: z
//         .number()
//         .describe(
//           "The zero-based index where the table will be inserted. If provided, 'location' will be used. If omitted and 'insertAtEndOfSegment' is false or omitted, 'endOfSegmentLocation' will be used for the document body.",
//         )
//         .optional()
//         .nullable(),
//       insertAtEndOfSegment: z
//         .boolean()
//         .describe(
//           "If true, inserts the table at the end of the segment (document body, header, or footer specified by segment_id). If false or omitted, and 'index' is not provided, it defaults to inserting at the end of the document body. If 'index' is provided, this field is ignored.",
//         )
//         .optional()
//         .nullable(),
//       rows: z.number().describe("The number of rows in the table."),
//       segmentId: z
//         .string()
//         .describe(
//           "The ID of the header, footer or footnote the location is in. An empty segment ID signifies the document's body.",
//         )
//         .optional()
//         .nullable(),
//       tabId: z
//         .string()
//         .describe(
//           "The tab that the location is in. When omitted, the request is applied to the first tab.",
//         )
//         .optional()
//         .nullable(),
//     }),
//     execute: async (params) =>
//       executeComposioTool("GOOGLEDOCS_INSERT_TABLE_ACTION", params, userId),
//   });
// };

// export const sentEmailTool = (userId: string) => {
//   return tool({
//     description: `Sends an email via gmail api using the authenticated user's google profile display name, requiring \`is html=true\` if the body contains html and valid \`s3key\`, \`mimetype\`, \`name\` for any attachment.`,
//     inputSchema: z.object({
//       attachment: z
//         .object({})
//         .describe(
//           "File to attach; ensure \`s3key\`, \`mimetype\`, and \`name\` are set if provided. Omit or set to null for no attachment.",
//         )
//         .optional(),
//       bcc: z
//         .array(z.string())
//         .describe("Blind Carbon Copy (BCC) recipients' email addresses.")
//         .optional(),
//       body: z
//         .string()
//         .describe(
//           "Email content (plain text or HTML); if HTML, \`is_html\` must be \`True\`.",
//         ),
//       cc: z
//         .array(z.string())
//         .describe("Carbon Copy (CC) recipients' email addresses.")
//         .optional(),
//       extra_recipients: z
//         .array(z.string())
//         .describe(
//           "Additional 'To' recipients' email addresses (not Cc or Bcc).",
//         )
//         .optional(),
//       is_html: z
//         .boolean()
//         .describe("Set to \`True\` if the email body contains HTML tags.")
//         .optional(),
//       recipient_email: z
//         .string()
//         .describe("Primary recipient's email address."),
//       subject: z
//         .string()
//         .describe("Subject line of the email.")
//         .optional()
//         .nullable(),
//       user_id: z
//         .string()
//         .describe(
//           "User's email address; the literal 'me' refers to the authenticated user.",
//         )
//         .optional(),
//     }),
//     execute: async (params) =>
//       executeComposioTool("GMAIL_SEND_EMAIL", params, userId),
//   });
// };

// export const fetchEmailsTool = (userId: string) => {
//   return tool({
//     description: `Fetches a list of email messages from a gmail account, supporting filtering, pagination, and optional full content retrieval.`,
//     inputSchema: z.object({
//       ids_only: z
//         .boolean()
//         .describe(
//           "If true, only returns message IDs from the list API without fetching individual message details. Fastest option for getting just message IDs and thread IDs.",
//         )
//         .optional(),
//       include_payload: z
//         .boolean()
//         .describe(
//           "Set to true to include full message payload (headers, body, attachments); false for metadata only.",
//         )
//         .optional(),
//       include_spam_trash: z
//         .boolean()
//         .describe("Set to true to include messages from 'SPAM' and 'TRASH'.")
//         .optional(),
//       label_ids: z
//         .array(z.string())
//         .describe(
//           "Filter by label IDs; only messages with all specified labels are returned. Common IDs: 'INBOX', 'SPAM', 'TRASH', 'UNREAD', 'STARRED', 'IMPORTANT', 'CATEGORY_PRIMARY' (alias 'CATEGORY_PERSONAL'), 'CATEGORY_SOCIAL', 'CATEGORY_PROMOTIONS', 'CATEGORY_UPDATES', 'CATEGORY_FORUMS'. Use 'listLabels' action for custom IDs.",
//         )
//         .optional(),
//       max_results: z
//         .number()
//         .describe("Maximum number of messages to retrieve per page.")
//         .optional(),
//       page_token: z
//         .string()
//         .describe(
//           "Token for retrieving a specific page, obtained from a previous response's \`nextPageToken\`. Omit for the first page.",
//         )
//         .optional()
//         .nullable(),
//       query: z
//         .string()
//         .describe(
//           "Gmail advanced search query (e.g., 'from:user subject:meeting'). Supports operators like 'from:', 'to:', 'subject:', 'label:', 'has:attachment', 'is:unread', 'after:YYYY/MM/DD', 'before:YYYY/MM/DD', AND/OR/NOT. Use quotes for exact phrases. Omit for no query filter.",
//         )
//         .optional()
//         .nullable(),
//       user_id: z
//         .string()
//         .describe("User's email address or 'me' for the authenticated user.")
//         .optional(),
//       verbose: z
//         .boolean()
//         .describe(
//           "If false, uses optimized concurrent metadata fetching for faster performance (~75% improvement). If true, uses standard detailed message fetching. When false, only essential fields (subject, sender, recipient, time, labels) are guaranteed.",
//         )
//         .optional(),
//     }),
//     execute: async (params) =>
//       executeComposioTool("GMAIL_FETCH_EMAILS", params, userId),
//   });
// };

// export const replyToThreadTool = (userId: string) => {
//   return tool({
//     description: `Sends a reply within a specific gmail thread using the original thread's subject, requiring a valid \`thread id\` and correctly formatted email addresses. supports attachments via the \`attachment\` parameter with valid \`s3key\`, \`mimetype\`, and \`name\`.`,
//     inputSchema: z.object({
//       attachment: z
//         .object({})
//         .describe("File to attach to the reply. Just Provide file path here")
//         .optional()
//         .nullable(),
//       bcc: z
//         .array(z.string())
//         .describe(
//           "BCC recipients' email addresses (hidden from other recipients).",
//         )
//         .optional(),
//       cc: z
//         .array(z.string())
//         .describe("CC recipients' email addresses.")
//         .optional(),
//       extra_recipients: z
//         .array(z.string())
//         .describe("Additional 'To' recipients' email addresses.")
//         .optional(),
//       is_html: z
//         .boolean()
//         .describe(
//           "Indicates if \`message_body\` is HTML; if True, body must be valid HTML, if False, body should not contain HTML tags.",
//         )
//         .optional(),
//       message_body: z
//         .string()
//         .describe("Content of the reply message, either plain text or HTML."),
//       recipient_email: z
//         .string()
//         .describe("Primary recipient's email address."),
//       thread_id: z
//         .string()
//         .describe("Identifier of the Gmail thread for the reply."),
//       user_id: z
//         .string()
//         .describe(
//           "Identifier for the user sending the reply; 'me' refers to the authenticated user.",
//         )
//         .optional(),
//     }),
//     execute: async (params) =>
//       executeComposioTool("GMAIL_REPLY_TO_THREAD", params, userId),
//   });
// };

// export const fetchEmailByMessageIdTool = (userId: string) => {
//   return tool({
//     description: `Fetches a specific email message by its id, provided the \`message id\` exists and is accessible to the authenticated \`user id\`.`,
//     inputSchema: z.object({
//       format: z
//         .string()
//         .describe(
//           "Format for message content: 'minimal' (ID/labels), 'full' (complete data), 'raw' (base64url string), 'metadata' (ID/labels/headers).",
//         )
//         .optional(),
//       message_id: z
//         .string()
//         .describe(
//           "Unique ID of the email message to retrieve, obtainable from actions like 'List Messages'.",
//         ),
//       user_id: z
//         .string()
//         .describe("User's email address or 'me' for the authenticated user.")
//         .optional(),
//     }),
//     execute: async (params) =>
//       executeComposioTool("GMAIL_FETCH_MESSAGE_BY_MESSAGE_ID", params, userId),
//   });
// };

// export const searchPeopleTool = (userId: string) => {
//   return tool({
//     description: `Searches contacts by matching the query against names, nicknames, emails, phone numbers, and organizations, optionally including 'other contacts'.`,
//     inputSchema: z.object({
//       other_contacts: z
//         .boolean()
//         .describe(
//           "Include 'Other Contacts' (interacted with but not explicitly saved) in search results; if false, searches only primary contacts.",
//         )
//         .optional(),
//       pageSize: z
//         .number()
//         .describe(
//           "Maximum results to return; values >30 are capped to 30 by the API.",
//         )
//         .optional(),
//       person_fields: z
//         .string()
//         .describe(
//           "Comma-separated fields to return (e.g., 'names,emailAddresses'); see PersonFields enum. If 'other_contacts' is true, only 'emailAddresses', 'names', 'phoneNumbers' are allowed.",
//         )
//         .optional(),
//       query: z
//         .string()
//         .describe(
//           "Matches contact names, nicknames, email addresses, phone numbers, and organization fields.",
//         ),
//     }),
//     execute: async (params) =>
//       executeComposioTool("GMAIL_SEARCH_PEOPLE", params, userId),
//   });
// };

// export const moveToTrashTool = (userid: string) => {
//   return tool({
//     description: `Moves an existing, non-deleted email message to the trash for the specified user.`,
//     inputSchema: z.object({
//       message_id: z
//         .string()
//         .describe("Identifier of the email message to move to trash."),
//       user_id: z
//         .string()
//         .describe("User's email address or 'me' for the authenticated user.")
//         .optional(),
//     }),
//     execute: async (params) =>
//       executeComposioTool("GMAIL_MOVE_TO_TRASH", params, userid),
//   });
// };

// export const createEmailDraftTool = (userId: string) => {
//   return tool({
//     description: `Creates a gmail email draft, supporting to/cc/bcc, subject, plain/html body (ensure \`is html=true\` for html), attachments, and threading.`,
//     inputSchema: z.object({
//       attachment: z
//         .object({})
//         .describe("File to attach to the email.")
//         .optional()
//         .nullable(),
//       bcc: z
//         .array(z.string())
//         .describe("'Bcc' (blind carbon copy) recipient email addresses.")
//         .optional(),
//       body: z
//         .string()
//         .describe(
//           "Email body content (plain text or HTML); \`is_html\` must be True if HTML.",
//         ),
//       cc: z
//         .array(z.string())
//         .describe("'Cc' (carbon copy) recipient email addresses.")
//         .optional(),
//       extra_recipients: z
//         .array(z.string())
//         .describe("Additional 'To' recipient email addresses.")
//         .optional(),
//       is_html: z
//         .boolean()
//         .describe(
//           "Set to True if \`body\` is HTML, otherwise the action may fail.",
//         )
//         .optional(),
//       recipient_email: z
//         .string()
//         .describe("Primary recipient's email address."),
//       subject: z.string().describe("Email subject line."),
//       thread_id: z
//         .string()
//         .describe(
//           "ID of an existing Gmail thread to reply to; omit for new thread.",
//         )
//         .optional()
//         .nullable(),
//       user_id: z
//         .string()
//         .describe("User's email address or 'me' for the authenticated user.")
//         .optional(),
//     }),
//     execute: async (params) =>
//       executeComposioTool("GMAIL_CREATE_EMAIL_DRAFT", params, userId),
//   });
// };
