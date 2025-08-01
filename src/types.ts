import { BrowserContext, Page } from '@playwright/test'

type SpeechToTextProvider = 'Default' | 'Gladia' | 'RunPod'

// Support both PascalCase and snake_case for recording_mode
export type RecordingMode = 'speaker_view' | 'gallery_view' | 'audio_only' | 'SpeakerView' | 'GalleryView' | 'AudioOnly'

/**
 * Normalizes recording mode values to snake_case format.
 * 
 * This function handles both PascalCase and snake_case values because:
 * 1. API requests come in snake_case format (e.g., "speaker_view")
 * 2. The API server converts these to PascalCase (e.g., "SpeakerView") when sending to the queue
 * 3. The smart-rabbit consumer can handle both cases via #[serde(alias = "...")] attributes
 * 4. The recording server needs to handle both cases for consistency with the queue message format
 * 
 * @param mode - The recording mode value (can be either PascalCase or snake_case)
 * @returns The normalized recording mode in snake_case format
 */
export function normalizeRecordingMode(mode: RecordingMode): 'speaker_view' | 'gallery_view' | 'audio_only' {
    switch (mode) {
        case 'speaker_view':
        case 'SpeakerView':
            return 'speaker_view'
        case 'gallery_view':
        case 'GalleryView':
            return 'gallery_view'
        case 'audio_only':
        case 'AudioOnly':
            return 'audio_only'
        default:
            // Default to speaker_view if unknown
            console.warn(`Unknown recording mode: ${mode}, defaulting to speaker_view`)
            return 'speaker_view'
    }
}

export interface MeetingProviderInterface {
    openMeetingPage(
        browserContext: BrowserContext,
        link: string,
        streaming_input: string | undefined,
    ): Promise<Page>
    joinMeeting(
        page: Page,
        cancelCheck: () => boolean,
        onJoinSuccess: () => void,
    ): Promise<void>
    findEndMeeting(page: Page): Promise<boolean>
    parseMeetingUrl(
        meeting_url: string,
    ): Promise<{ meetingId: string; password: string }>
    getMeetingLink(
        meeting_id: string,
        _password: string,
        _role: number,
        _bot_name: string,
        _enter_message?: string,
    ): string
    closeMeeting(page: Page): Promise<void>
}

export type MeetingParams = {
    id: string
    use_my_vocabulary: boolean
    meeting_url: string
    user_token: string
    bot_name: string
    user_id: number
    session_id: string
    email: string
    meetingProvider: MeetingProvider
    event?: { id: number }
    agenda?: any
    custom_branding_bot_path?: string
    vocabulary: string[]
    force_lang: boolean
    translation_lang?: string
    speech_to_text_provider?: SpeechToTextProvider
    speech_to_text_api_key?: string
    streaming_input?: string
    streaming_output?: string
    streaming_audio_frequency?: number
    bot_uuid: string
    enter_message?: string
    bots_api_key: string
    bots_webhook_url?: string
    recording_mode: RecordingMode
    local_recording_server_location: string
    automatic_leave: {
        // The number of seconds after which the bot will automatically leave the call, if it has not been let in from the waiting room.
        waiting_room_timeout: number
        // The number of seconds after which the bot will automatically leave the call, if it has joined the meeting but no other participant has joined.
        noone_joined_timeout: number
        // The number of seconds after which the bot will automatically leave the call, if there were other participants in the call who have all left.
        // everyone_left_timeout?: number
        // The number of seconds after which the bot will automatically leave the call, if it has joined the call but not started recording.
        // in_call_not_recording_timeout?: number
        // The number of seconds after which the bot will automatically leave the call, if it has joined the call and started recording it. This can be used to enforce a maximum recording time limit for a bot. There is no default value for this parameter, meaning a bot will continue to record for as long as the meeting lasts.
        // in_call_recording_timeout?: number
        // The number of seconds after which the bot will automatically leave the call, if it has joined the call but has not started recording. For e.g This can occur due to bot being denied permission to record(Zoom meetings).
        // recording_permission_denied_timeout?: number
    }
    mp4_s3_path: string
    // ----------------- TODO -------------------- SECTION RAJOUTEE
    environ: string // local, prod or preprod
    aws_s3_temporary_audio_bucket: string
    remote: {
        s3_args: string[]
        api_server_baseurl: string
        aws_s3_video_bucket: string
        aws_s3_log_bucket: string
        aws_s3_public?: boolean
    } | null
    // -----------------------------------------------------------
    secret: string
    extra?: any
    zoom_sdk_id?: string
    zoom_sdk_pwd?: string
}

export type StopRecordParams = {
    meeting_url: string
    user_id: number
}

export type SpeakerData = {
    name: string
    id: number
    timestamp: number
    isSpeaking: boolean
}
export type MeetingProvider = 'Meet' | 'Teams' | 'Zoom'
