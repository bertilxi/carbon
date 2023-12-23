// eslint-disable-next-line unicorn/prefer-add-event-listener
window.onerror = function (message, url, _, __, error) {
  try {
    fetch("/sentinel", {
      method: "POST",
      body: JSON.stringify({
        message,
        url,
        agent: window.navigator.userAgent,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        height: window.screen.height,
        width: window.screen.width,
        cookies: navigator.cookieEnabled ? document.cookie : "disabled",
        stack: error?.stack,
      }),
    }).catch(() => {});
  } catch {
    //
  }

  return false;
};
