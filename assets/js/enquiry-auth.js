(function () {
  'use strict';

  var CFG = window.AKAYA_EMAILJS || {};
  var VARS = CFG.vars || {};
  var MIN_MSG = CFG.minMessageLength || 10;

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function digits(v) {
    return (v || '').replace(/\D/g, '');
  }

  function validPhone(v) {
    if (!v || !v.trim()) return false;
    var d = digits(v);
    if (d.length === 10) return /^[6-9]/.test(d);
    if (d.length === 12 && d.slice(0, 2) === '91') return /^[6-9]/.test(d.slice(2));
    return false;
  }

  function normalizedPhone(v) {
    var d = digits(v);
    if (d.length === 10) return '91' + d;
    return d;
  }

  function validMessage(v) {
    return (v || '').trim().length >= MIN_MSG;
  }

  function setStatus(el, msg, kind) {
    if (!el) return;
    el.textContent = msg || '';
    el.className = 'verify-status' + (kind ? ' ' + kind : '');
  }

  function isEmailEnquiryConfigured() {
    return (
      typeof window.emailjs !== 'undefined' &&
      CFG.publicKey && CFG.publicKey.indexOf('YOUR_') !== 0 &&
      CFG.serviceId && CFG.serviceId.indexOf('YOUR_') !== 0 &&
      CFG.templateIdEnquiry && CFG.templateIdEnquiry.indexOf('YOUR_') !== 0
    );
  }

  function isEmailVerificationEnabled() {
    return CFG.emailVerificationEnabled !== false;
  }

  function initEmailJs() {
    if (!isEmailEnquiryConfigured()) return;
    try {
      window.emailjs.init({ publicKey: CFG.publicKey });
    } catch (e) {}
  }

  function emailJsSendOptions() {
    return { publicKey: CFG.publicKey };
  }

  function formatEmailJsError(err, fallback) {
    var text = (err && (err.text || err.message)) || '';

    if (/insufficient authentication scopes/i.test(text)) {
      return 'Gmail is not authorised to send mail. In EmailJS, reconnect your Gmail service and allow send permission.';
    }
    if (/origin|forbidden|403/i.test(text)) {
      return 'This site is not allowed to send email yet. In EmailJS → Account → Security, add ' +
        window.location.origin + ' under Allowed origins.';
    }
    if (/template|service|not found|invalid/i.test(text)) {
      return 'Email service misconfigured (template or service ID). Check enquiry-config.js matches your EmailJS dashboard.';
    }
    if (text) return text;
    return fallback || 'Something went wrong. Please try again.';
  }

  function genCode() {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  function initWhatsAppEnquiry() {
    var form = document.getElementById('whatsapp-form');
    if (!form) return;

    var el = {
      name: form.querySelector('[name="Name"]'),
      phone: form.querySelector('[name="Phone"]'),
      message: form.querySelector('[name="Message"]'),
      honeypot: form.querySelector('[name="Company"]'),
      status: document.getElementById('wa-status'),
    };

    function validate(focus) {
      if (!el.name.value.trim()) {
        if (focus) el.name.focus();
        return 'Please enter your name.';
      }
      if (!validPhone(el.phone.value)) {
        if (focus) el.phone.focus();
        return 'Please enter a valid Indian mobile number (10 digits, starting 6-9).';
      }
      if (!validMessage(el.message.value)) {
        if (focus) el.message.focus();
        return 'Please enter a message (at least ' + MIN_MSG + ' characters).';
      }
      return null;
    }

    function buildWhatsAppUrl() {
      var lines = ['*Akaya Serenity enquiry*', '-----------------------'];
      lines.push('Name: ' + el.name.value.trim());
      lines.push('Phone: +' + normalizedPhone(el.phone.value));
      lines.push('Message: ' + el.message.value.trim());

      var number =
        (window.SITE_CONTACT && window.SITE_CONTACT.whatsapp_number) || '919886354057';
      return 'https://wa.me/' + number + '?text=' + encodeURIComponent(lines.join('\n'));
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (el.honeypot && el.honeypot.value) return;

      var err = validate(true);
      if (err) {
        setStatus(el.status, err, 'err');
        return;
      }

      setStatus(el.status, '', null);
      window.open(buildWhatsAppUrl(), '_blank', 'noopener');
    });
  }

  function initEmailEnquiry() {
    var form = document.getElementById('email-form');
    if (!form) return;

    var el = {
      name: form.querySelector('[name="Name"]'),
      email: form.querySelector('[name="Email"]'),
      phone: form.querySelector('[name="Phone"]'),
      message: form.querySelector('[name="Message"]'),
      honeypot: form.querySelector('[name="Website"]'),
      verifyBlock: document.getElementById('email-verify-block'),
      sendCodeBtn: document.getElementById('email-send-code'),
      codeRow: document.getElementById('email-code-row'),
      codeInput: document.getElementById('email-verify-code'),
      confirmBtn: document.getElementById('email-confirm-code'),
      submitBtn: document.getElementById('email-submit'),
      status: document.getElementById('email-status'),
    };

    var state = {
      code: null,
      expires: 0,
      verifiedEmail: null,
      sends: 0,
      lastSent: 0,
      sending: false,
      submitting: false,
    };

    function setSubmitEnabled(on) {
      if (el.submitBtn) el.submitBtn.disabled = !on;
    }

    function validateForVerify(focus) {
      if (!el.name.value.trim()) {
        if (focus) el.name.focus();
        return 'Please enter your name.';
      }
      if (!EMAIL_RE.test(el.email.value.trim())) {
        if (focus) el.email.focus();
        return 'Please enter a valid email address.';
      }
      return null;
    }

    function validateFields(focus) {
      if (!el.name.value.trim()) {
        if (focus) el.name.focus();
        return 'Please enter your name.';
      }
      if (!EMAIL_RE.test(el.email.value.trim())) {
        if (focus) el.email.focus();
        return 'Please enter a valid email address.';
      }
      if (el.phone.value.trim() && !validPhone(el.phone.value)) {
        if (focus) el.phone.focus();
        return 'Please enter a valid Indian mobile number, or leave phone blank.';
      }
      if (!validMessage(el.message.value)) {
        if (focus) el.message.focus();
        return 'Please enter a message (at least ' + MIN_MSG + ' characters).';
      }
      return null;
    }

    function resetVerification() {
      state.code = null;
      state.verifiedEmail = null;
      setSubmitEnabled(!isEmailVerificationEnabled());
      if (el.codeRow) el.codeRow.hidden = true;
      if (el.codeInput) {
        el.codeInput.value = '';
        el.codeInput.disabled = false;
      }
      if (el.confirmBtn) el.confirmBtn.disabled = false;
      if (el.sendCodeBtn) el.sendCodeBtn.textContent = 'Verify email';
    }

    function sendCode() {
      if (state.sending || !isEmailEnquiryConfigured() || !isEmailVerificationEnabled()) return;

      var err = validateForVerify(true);
      if (err) {
        setStatus(el.status, err, 'err');
        return;
      }

      var now = Date.now();
      if (state.lastSent && now - state.lastSent < (CFG.resendCooldownMs || 30000)) {
        var wait = Math.ceil(((CFG.resendCooldownMs || 30000) - (now - state.lastSent)) / 1000);
        setStatus(el.status, 'Please wait ' + wait + 's before requesting another code.', 'err');
        return;
      }
      if (state.sends >= (CFG.maxSendsPerSession || 5)) {
        setStatus(el.status, 'Too many code requests. Please reload the page and try again.', 'err');
        return;
      }

      var email = el.email.value.trim();
      var code = genCode();
      var params = {};
      params[VARS.toEmail || 'to_email'] = email;
      params[VARS.code || 'passcode'] = code;
      params[VARS.siteName || 'site_name'] = 'Akaya Serenity';

      state.sending = true;
      el.sendCodeBtn.disabled = true;
      setStatus(el.status, 'Sending code\u2026', null);

      window.emailjs
        .send(CFG.serviceId, CFG.templateIdVerify, params, emailJsSendOptions())
        .then(function () {
          state.code = code;
          state.expires = Date.now() + (CFG.codeTtlMs || 600000);
          state.lastSent = Date.now();
          state.sends += 1;
          state.sending = false;
          el.sendCodeBtn.disabled = false;
          el.sendCodeBtn.textContent = 'Resend code';
          if (el.codeRow) el.codeRow.hidden = false;
          if (el.codeInput) el.codeInput.focus();
          setStatus(el.status, 'We emailed a 6-digit code to ' + email + '. Enter it above.', 'ok');
        })
        .catch(function (e) {
          state.sending = false;
          el.sendCodeBtn.disabled = false;
          setStatus(
            el.status,
            formatEmailJsError(e, 'Could not send the code. Please check the email and try again.'),
            'err'
          );
        });
    }

    function confirmCode() {
      if (!state.code) {
        setStatus(el.status, 'Please request a code first.', 'err');
        return;
      }
      if (Date.now() > state.expires) {
        state.code = null;
        setStatus(el.status, 'That code has expired. Please resend a new one.', 'err');
        return;
      }
      var entered = digits(el.codeInput && el.codeInput.value);
      if (entered === state.code) {
        state.verifiedEmail = el.email.value.trim();
        setSubmitEnabled(true);
        setStatus(el.status, 'Email verified \u2713 You can now send your enquiry.', 'ok');
        if (el.confirmBtn) el.confirmBtn.disabled = true;
        if (el.codeInput) el.codeInput.disabled = true;
      } else {
        setStatus(el.status, 'That code is incorrect. Please check and try again.', 'err');
      }
    }

    function sendEnquiry() {
      if (state.submitting) return;

      var err = validateFields(true);
      if (err) {
        setStatus(el.status, err, 'err');
        return;
      }

      if (isEmailVerificationEnabled()) {
        if (!state.verifiedEmail || state.verifiedEmail !== el.email.value.trim()) {
          setStatus(el.status, 'Please verify your email before sending.', 'err');
          return;
        }
      }

      var params = {};
      params[VARS.fromName || 'from_name'] = el.name.value.trim();
      params[VARS.fromEmail || 'from_email'] = el.email.value.trim();
      params[VARS.fromPhone || 'from_phone'] = el.phone.value.trim()
        ? '+' + normalizedPhone(el.phone.value)
        : 'Not provided';
      params[VARS.message || 'message'] = el.message.value.trim();
      params[VARS.replyTo || 'reply_to'] = el.email.value.trim();

      state.submitting = true;
      el.submitBtn.disabled = true;
      setStatus(el.status, 'Sending enquiry\u2026', null);

      window.emailjs
        .send(CFG.serviceId, CFG.templateIdEnquiry, params, emailJsSendOptions())
        .then(function () {
          state.submitting = false;
          setStatus(el.status, 'Enquiry sent \u2713 We\u2019ll reply to your email soon.', 'ok');
          form.reset();
          resetVerification();
          if (isEmailVerificationEnabled() && el.verifyBlock) el.verifyBlock.hidden = false;
        })
        .catch(function (e) {
          state.submitting = false;
          setSubmitEnabled(true);
          setStatus(
            el.status,
            formatEmailJsError(e, 'Could not send your enquiry. Please try again.'),
            'err'
          );
        });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (el.honeypot && el.honeypot.value) return;
      sendEnquiry();
    });

    if (isEmailEnquiryConfigured()) {
      if (isEmailVerificationEnabled()) {
        if (el.verifyBlock) el.verifyBlock.hidden = false;
        setSubmitEnabled(false);

        if (el.sendCodeBtn) el.sendCodeBtn.addEventListener('click', sendCode);
        if (el.confirmBtn) el.confirmBtn.addEventListener('click', confirmCode);
        if (el.codeInput) {
          el.codeInput.addEventListener('keydown', function (ev) {
            if (ev.key === 'Enter') {
              ev.preventDefault();
              confirmCode();
            }
          });
        }
        if (el.email) {
          el.email.addEventListener('input', function () {
            resetVerification();
            setStatus(el.status, '', null);
          });
        }
      } else {
        if (el.verifyBlock) el.verifyBlock.hidden = true;
        setSubmitEnabled(true);
      }
    } else {
      if (el.verifyBlock) el.verifyBlock.hidden = true;
      setSubmitEnabled(false);
      setStatus(
        el.status,
        'Email enquiries are not configured yet. Use WhatsApp or contact us directly.',
        null
      );
    }
  }

  initEmailJs();
  initWhatsAppEnquiry();
  initEmailEnquiry();
})();
