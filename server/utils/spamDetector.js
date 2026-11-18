/**
 * Spam & Fake Inquiry Detection Utility
 * Filters out bot-generated, gibberish, and spam inquiries before saving or emailing.
 */

// Common spam keywords
const SPAM_KEYWORDS = [
  'crypto', 'bitcoin', 'ethereum', 'forex', 'casino', 'betting', 'poker',
  'viagra', 'cialis', 'porn', 'adult', 'sex', 'dating',
  'seo ranking', 'backlinks', 'guest post', 'traffic boost',
  'whatsapp loan', 't.me/', 'telegram.me', 'bit.ly/', 'tinyurl.com'
];

/**
 * Checks if a string has excessive consecutive consonants (classic gibberish indicator)
 */
function hasExcessiveConsonantCluster(str) {
  // 5 or more consonants in a row (excluding legitimate words)
  return /[bcdfghjklmnpqrstvwxyz]{5,}/i.test(str);
}

/**
 * Checks if a message looks like a random string of characters (e.g., "pzJCphDgdSuVcnaijUrP")
 */
function isRandomGibberishToken(str) {
  const trimmed = str.trim();
  // Single token of length >= 10 with no whitespace, mixing case or random letters
  if (trimmed.length >= 10 && !/\s/.test(trimmed)) {
    // If it has at least 1 uppercase and 1 lowercase and 10+ chars without spaces
    const hasUpper = /[A-Z]/.test(trimmed);
    const hasLower = /[a-z]/.test(trimmed);
    if (hasUpper && hasLower) return true;
  }
  return false;
}

/**
 * Checks if phone number is obvious dummy or repeated digits
 */
function isFakePhone(phone) {
  if (!phone) return true;
  const digits = phone.replace(/\D/g, '');

  // Must have reasonable length (e.g. 8-15 digits)
  if (digits.length < 8 || digits.length > 15) {
    return true;
  }

  // All identical digits (e.g., 7777777777, 0000000000, 9999999999)
  if (/^(\d)\1+$/.test(digits)) {
    return true;
  }

  // Sequential numbers (e.g., 1234567890, 0123456789, 9876543210)
  const sequentialPatterns = ['1234567890', '0123456789', '9876543210'];
  if (sequentialPatterns.some(seq => digits.includes(seq))) {
    return true;
  }

  return false;
}

/**
 * Checks if email matches common bot generation patterns
 */
function isFakeEmail(email) {
  if (!email || typeof email !== 'string') return true;
  const [localPart, domain] = email.toLowerCase().split('@');
  if (!localPart || !domain) return true;

  // Bot Gmail dot-trick pattern: multiple single-character dots (e.g., iva.p.u.r.uxi.72 or 4+ dots)
  const dotCount = (localPart.match(/\./g) || []).length;
  if (dotCount >= 3 && /([a-z0-9]\.){2,}[a-z0-9]/.test(localPart)) {
    return true;
  }

  // Suspicious temporary / throwaway domains
  const blockedDomains = [
    'tempmail.com', 'throwaway.com', 'mailinator.com', 'guerrillamail.com',
    '10minutemail.com', 'yopmail.com', 'sharklasers.com'
  ];
  if (blockedDomains.includes(domain)) {
    return true;
  }

  return false;
}

/**
 * Main evaluation function
 * Returns { isSpam: boolean, reason: string }
 */
function evaluateInquiry(data) {
  const {
    fullName = '',
    email = '',
    phone = '',
    message = '',
    // Honeypot fields bots might fill
    website,
    url,
    fax,
    company_url,
    _hp
  } = data;

  // 1. Honeypot check (Bots fill hidden fields that real users never see)
  if (website || url || fax || company_url || _hp) {
    return { isSpam: true, reason: 'Honeypot field triggered' };
  }

  const cleanMsg = (message || '').trim();
  const cleanName = (fullName || '').trim();
  const cleanPhone = (phone || '').trim();
  const cleanEmail = (email || '').trim();

  // 2. Minimum content check
  if (cleanMsg.length < 4) {
    return { isSpam: true, reason: 'Message too short (minimum 4 characters required)' };
  }

  // 3. Repeated single character in message (e.g., "ssss", "aaaaa", ".....")
  if (/^(.)\1{3,}$/i.test(cleanMsg)) {
    return { isSpam: true, reason: 'Repetitive characters in message' };
  }

  // 4. Random gibberish token message (e.g. "pzJCphDgdSuVcnaijUrP")
  if (isRandomGibberishToken(cleanMsg)) {
    return { isSpam: true, reason: 'Gibberish message pattern detected' };
  }

  // 5. Bot email pattern (dot trick spam)
  if (isFakeEmail(cleanEmail)) {
    return { isSpam: true, reason: 'Suspicious email address pattern' };
  }

  // 6. Fake / Dummy phone number
  if (isFakePhone(cleanPhone)) {
    return { isSpam: true, reason: 'Invalid or dummy phone number' };
  }

  // 7. Russian / Cyrillic script spam
  if (/[\u0400-\u04FF]/.test(cleanMsg) || /[\u0400-\u04FF]/.test(cleanName)) {
    return { isSpam: true, reason: 'Unsupported character set / Cyrillic spam' };
  }

  // 8. Spam keywords check
  const lowerMsg = cleanMsg.toLowerCase();
  for (const keyword of SPAM_KEYWORDS) {
    if (lowerMsg.includes(keyword)) {
      return { isSpam: true, reason: `Spam keyword detected: "${keyword}"` };
    }
  }

  // 9. Fake name gibberish check (e.g. 5+ consecutive consonants)
  if (hasExcessiveConsonantCluster(cleanName)) {
    return { isSpam: true, reason: 'Unnatural name format / consonant cluster' };
  }

  // 10. Excessive URLs in message
  const urlMatches = cleanMsg.match(/https?:\/\//gi);
  if (urlMatches && urlMatches.length > 1) {
    return { isSpam: true, reason: 'Multiple URLs in inquiry message' };
  }

  return { isSpam: false, reason: null };
}

module.exports = {
  evaluateInquiry,
  isFakePhone,
  isFakeEmail,
  isRandomGibberishToken
};
