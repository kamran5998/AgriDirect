import crypto from 'crypto';

export interface OtpChallenge {
  phone: string;
  code: string;
  expiresAt: number; // Unix timestamp ms
  createdAt: number;
  attempts: number;
  maxAttempts: number;
  lastResendTime: number;
  resendCount: number;
  provider: 'fast2sms' | 'twilio' | 'msg91' | 'dev_simulation';
  deliveryStatus: 'delivered' | 'pending' | 'simulated';
}

export interface SendOtpResult {
  success: boolean;
  message: string;
  provider: string;
  isDevMode: boolean;
  expiresInSeconds: number;
  cooldownSeconds: number;
  demoOtpHint?: string;
  error?: string;
}

export interface VerifyOtpResult {
  success: boolean;
  message: string;
  phone?: string;
  error?: string;
}

// In-memory store for active OTP challenges
const otpStore = new Map<string, OtpChallenge>();

// Configuration constants
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const RESEND_COOLDOWN_MS = 30 * 1000; // 30 seconds
const MAX_ATTEMPTS = 3;
const MAX_RESENDS = 5;

/**
 * Sanitizes phone number to standard 10-digit format
 */
export function sanitizePhoneNumber(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length > 10) return digits.slice(-10);
  return digits;
}

/**
 * Generates a cryptographically random 4 or 6 digit OTP
 */
function generateDynamicOtp(digits = 4): string {
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;
  return crypto.randomInt(min, max + 1).toString();
}

/**
 * Sends an OTP using configured provider (Fast2SMS, Twilio, MSG91, or Development Simulation)
 */
export async function sendOtp(phoneInput: string): Promise<SendOtpResult> {
  const phone = sanitizePhoneNumber(phoneInput);
  if (!phone || phone.length !== 10) {
    return {
      success: false,
      message: 'A valid 10-digit mobile number is required',
      provider: 'none',
      isDevMode: false,
      expiresInSeconds: 0,
      cooldownSeconds: 0,
      error: 'Invalid phone number format',
    };
  }

  const now = Date.now();
  const existing = otpStore.get(phone);

  // Check resend cooldown rate limit
  if (existing && now - existing.lastResendTime < RESEND_COOLDOWN_MS) {
    const remainingSeconds = Math.ceil((RESEND_COOLDOWN_MS - (now - existing.lastResendTime)) / 1000);
    return {
      success: false,
      message: `Please wait ${remainingSeconds} seconds before requesting a new OTP.`,
      provider: existing.provider,
      isDevMode: existing.provider === 'dev_simulation',
      expiresInSeconds: Math.max(0, Math.ceil((existing.expiresAt - now) / 1000)),
      cooldownSeconds: remainingSeconds,
      error: 'RATE_LIMIT_COOLDOWN',
    };
  }

  // Check maximum resend limit
  if (existing && existing.resendCount >= MAX_RESENDS && now < existing.expiresAt) {
    return {
      success: false,
      message: 'Maximum OTP request attempts exceeded for this session. Please try again after 5 minutes.',
      provider: existing.provider,
      isDevMode: existing.provider === 'dev_simulation',
      expiresInSeconds: Math.ceil((existing.expiresAt - now) / 1000),
      cooldownSeconds: 0,
      error: 'MAX_RESENDS_EXCEEDED',
    };
  }

  // Generate dynamic 4-digit code (standard for rural telecom OTP delivery)
  const code = generateDynamicOtp(4);
  const expiresAt = now + OTP_EXPIRY_MS;

  // Determine Provider from Environment
  const providerType = (process.env.OTP_PROVIDER || '').toLowerCase();
  const fast2SmsKey = process.env.FAST2SMS_API_KEY || process.env.OTP_API_KEY;
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_FROM_PHONE;
  const msg91Key = process.env.MSG91_AUTH_KEY;

  let activeProvider: OtpChallenge['provider'] = 'dev_simulation';
  let deliveryStatus: OtpChallenge['deliveryStatus'] = 'simulated';
  let deliveryError: string | undefined;

  // 1. Fast2SMS Integration (India National SMS gateway)
  if ((providerType === 'fast2sms' || (!providerType && fast2SmsKey)) && fast2SmsKey) {
    try {
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: fast2SmsKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'otp',
          variables_values: code,
          numbers: phone,
        }),
      });
      const data = await response.json() as any;
      if (data.return) {
        activeProvider = 'fast2sms';
        deliveryStatus = 'delivered';
        console.log(`[OTP Gateway] Fast2SMS dispatched successfully to +91-${phone}`);
      } else {
        console.warn(`[OTP Gateway] Fast2SMS returned non-success:`, data.message);
        deliveryError = data.message;
      }
    } catch (e: any) {
      console.warn(`[OTP Gateway] Fast2SMS dispatch failed:`, e.message);
      deliveryError = e.message;
    }
  }

  // 2. Twilio SMS Integration
  else if ((providerType === 'twilio' || (!providerType && twilioSid && twilioToken)) && twilioSid && twilioToken && twilioFrom) {
    try {
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
      const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
      const body = new URLSearchParams({
        From: twilioFrom,
        To: `+91${phone}`,
        Body: `AgriDirect Pulse: Your Kisan verification code is ${code}. Valid for 5 minutes. Do not share this OTP with anyone.`,
      });

      const response = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      if (response.ok) {
        activeProvider = 'twilio';
        deliveryStatus = 'delivered';
        console.log(`[OTP Gateway] Twilio SMS dispatched successfully to +91-${phone}`);
      } else {
        const errorText = await response.text();
        console.warn(`[OTP Gateway] Twilio SMS failed:`, errorText);
        deliveryError = 'Twilio SMS dispatch failed';
      }
    } catch (e: any) {
      console.warn(`[OTP Gateway] Twilio dispatch error:`, e.message);
      deliveryError = e.message;
    }
  }

  // 3. MSG91 Integration
  else if ((providerType === 'msg91' || (!providerType && msg91Key)) && msg91Key) {
    try {
      const templateId = process.env.MSG91_TEMPLATE_ID || 'agridirect_login';
      const msg91Url = `https://control.msg91.com/api/v5/otp?template_id=${templateId}&mobile=91${phone}&authkey=${msg91Key}&otp=${code}`;
      const response = await fetch(msg91Url, { method: 'POST' });
      if (response.ok) {
        activeProvider = 'msg91';
        deliveryStatus = 'delivered';
        console.log(`[OTP Gateway] MSG91 dispatched successfully to +91-${phone}`);
      } else {
        deliveryError = 'MSG91 dispatch failed';
      }
    } catch (e: any) {
      deliveryError = e.message;
    }
  }

  // Record Challenge in Store
  const resendCount = existing ? existing.resendCount + 1 : 1;
  otpStore.set(phone, {
    phone,
    code,
    expiresAt,
    createdAt: now,
    attempts: 0,
    maxAttempts: MAX_ATTEMPTS,
    lastResendTime: now,
    resendCount,
    provider: activeProvider,
    deliveryStatus,
  });

  const isDev = activeProvider === 'dev_simulation';
  if (isDev) {
    console.log(`\n========================================`);
    console.log(`[OTP SERVICE: DEVELOPMENT SIMULATION]`);
    console.log(`Target Phone: +91-${phone}`);
    console.log(`Dynamic OTP:  ${code}`);
    console.log(`Expires In:   5 minutes`);
    console.log(`To configure real SMS delivery, set FAST2SMS_API_KEY or TWILIO credentials in environment.`);
    console.log(`========================================\n`);
  }

  return {
    success: true,
    message: isDev
      ? `OTP generated successfully. (Development mode simulation: ${code})`
      : `OTP dispatched to mobile number ending in ${phone.slice(-4)}.`,
    provider: activeProvider,
    isDevMode: isDev,
    expiresInSeconds: Math.ceil(OTP_EXPIRY_MS / 1000),
    cooldownSeconds: Math.ceil(RESEND_COOLDOWN_MS / 1000),
    demoOtpHint: isDev ? code : undefined,
  };
}

/**
 * Verifies a submitted OTP code against active challenges
 */
export function verifyOtp(phoneInput: string, codeInput: string): VerifyOtpResult {
  const phone = sanitizePhoneNumber(phoneInput);
  const code = (codeInput || '').trim();

  if (!phone || phone.length !== 10) {
    return {
      success: false,
      message: 'Please provide a valid 10-digit mobile number.',
      error: 'INVALID_PHONE_FORMAT',
    };
  }

  if (!code || code.length < 4) {
    return {
      success: false,
      message: 'Please enter the complete OTP code received on your phone.',
      error: 'INVALID_CODE_FORMAT',
    };
  }

  const challenge = otpStore.get(phone);

  if (!challenge) {
    return {
      success: false,
      message: 'No active OTP request found for this number. Please click "Resend OTP".',
      error: 'NO_ACTIVE_CHALLENGE',
    };
  }

  const now = Date.now();

  // Check expiration
  if (now > challenge.expiresAt) {
    otpStore.delete(phone);
    return {
      success: false,
      message: 'This OTP has expired. Please request a new verification code.',
      error: 'OTP_EXPIRED',
    };
  }

  // Check attempt exhaustion
  if (challenge.attempts >= challenge.maxAttempts) {
    otpStore.delete(phone);
    return {
      success: false,
      message: 'Maximum verification attempts exceeded. Please request a new OTP.',
      error: 'MAX_ATTEMPTS_EXCEEDED',
    };
  }

  // Increment attempts
  challenge.attempts += 1;

  // Exact comparison
  if (challenge.code !== code) {
    const remaining = challenge.maxAttempts - challenge.attempts;
    if (remaining <= 0) {
      otpStore.delete(phone);
      return {
        success: false,
        message: 'Incorrect OTP. You have exhausted all attempts. Please request a new code.',
        error: 'INCORRECT_CODE_FINAL',
      };
    }
    return {
      success: false,
      message: `Incorrect OTP code. ${remaining} attempt${remaining > 1 ? 's' : ''} remaining.`,
      error: 'INCORRECT_CODE',
    };
  }

  // Success: Invalidate challenge to prevent replay attacks
  otpStore.delete(phone);
  return {
    success: true,
    message: 'OTP verified successfully.',
    phone,
  };
}
