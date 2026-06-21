/*
 * EmailJS settings for enquiry verification and delivery.
 * Setup steps: README.md → Enquiry section.
 * EmailJS → Account → Security → Allowed origins: https://akayaserenity.com
 */
window.AKAYA_EMAILJS = {
  publicKey: 'NRtj8G-Z-lWXKyQe9',
  serviceId: 'akaya_email_verify',
  templateIdVerify: 'akaya_email_verify',
  templateIdEnquiry: 'akaya_enquiry',

  emailVerificationEnabled: true,

  vars: {
    toEmail: 'to_email',
    code: 'passcode',
    siteName: 'site_name',
    fromName: 'from_name',
    fromEmail: 'from_email',
    fromPhone: 'from_phone',
    message: 'message',
    replyTo: 'reply_to',
  },

  minMessageLength: 10,
  codeTtlMs: 10 * 60 * 1000,
  resendCooldownMs: 30 * 1000,
  maxSendsPerSession: 5,
};
