// One place to edit your public support email.
const SUPPORT_EMAIL = 'hello@frost-co.org';
document.querySelectorAll('[data-email]').forEach(el => {
  el.textContent = SUPPORT_EMAIL;
  if (el.tagName === 'A') el.href = 'mailto:' + SUPPORT_EMAIL;
});
