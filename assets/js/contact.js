document.addEventListener('DOMContentLoaded', function () {
  fetch('assets/data/contact.json')
    .then(function (r) { return r.json(); })
    .then(function (c) {
      window.SITE_CONTACT = c;

      // Text replacements: data-contact="key"
      document.querySelectorAll('[data-contact]').forEach(function (el) {
        var key = el.getAttribute('data-contact');
        if (!key) return;
        if (key === 'phone') el.textContent = c.phone_display;
        else if (key === 'email') el.textContent = c.email;
        else if (key === 'address') el.textContent = c.address;
        else if (key === 'domain') el.textContent = c.domain;
        else if (c[key]) el.textContent = c[key];
      });

      // Href replacements: data-contact-href="type"
      document.querySelectorAll('[data-contact-href]').forEach(function (el) {
        var key = el.getAttribute('data-contact-href');
        if (!key) return;
        if (key === 'whatsapp') {
          el.setAttribute('href', 'https://wa.me/' + c.whatsapp_number);
          el.setAttribute('target', '_blank');
          el.setAttribute('rel', 'noopener');
        } else if (key === 'mailto') {
          el.setAttribute('href', 'mailto:' + c.email);
        } else if (key === 'tel') {
          el.setAttribute('href', 'tel:' + c.phone_e164);
        }
      });
    })
    .catch(function (err) {
      console.error('Failed to load contact data', err);
    });
});
