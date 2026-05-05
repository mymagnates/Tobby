const normalizeReason = (value) => String(value || '').trim()

export const formatOwnerInviteFallbackReason = (reason) => {
  const normalized = normalizeReason(reason)
  if (!normalized) return 'Invite email delivery is not configured. Share the invite link manually.'

  const lowered = normalized.toLowerCase()

  if (lowered === 'missing_resend_api_key') {
    return 'Backend email delivery is not configured. Set RESEND_API_KEY on the API server.'
  }

  if (lowered === 'missing_invite_email_from') {
    return 'Backend sender email is not configured. Set INVITE_EMAIL_FROM on the API server.'
  }

  if (
    lowered.includes('verify a domain') ||
    lowered.includes('domain is not verified') ||
    lowered.includes('testing emails') ||
    lowered.includes('test emails')
  ) {
    return 'The sender address is not ready for real delivery. Configure INVITE_EMAIL_FROM with a verified Resend domain.'
  }

  if (lowered === 'resend_401' || lowered.includes('unauthorized')) {
    return 'The email provider rejected the request. Check the backend Resend API key.'
  }

  if (lowered === 'resend_request_failed') {
    return 'The API server could not reach the email provider. Share the invite link manually for now.'
  }

  if (lowered.startsWith('resend_')) {
    return `The email provider rejected the request (${normalized}). Share the invite link manually.`
  }

  return normalized
}

