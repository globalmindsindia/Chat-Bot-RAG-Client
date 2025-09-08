(function () {
  const ID = "globalminds-chatbot";
  let el = document.getElementById(ID);
  if (!el) {
    el = document.createElement("div");
    el.id = ID;
    document.body.appendChild(el);
  }

  // Always use localhost
  const cssHref =
    "https://chat.globalmindsindia.com/dist/global-chat-widget.css";
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = cssHref;
  document.head.appendChild(link);

  function load(src, cb) {
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = cb;
    document.head.appendChild(s);
  }

  function loadWidget() {
    const bundleUrl =
      "https://chat.globalmindsindia.com/dist/global-chat-widget.umd.js";
    load(bundleUrl, () => {
      if (typeof window.initGlobalChat === "function") {
        window.initGlobalChat({ containerId: ID });
      }
    });
  }

  loadWidget();
})();
