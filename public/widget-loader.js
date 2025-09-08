(function () {
  const ID = "globalminds-chatbot";
  let el = document.getElementById(ID);
  if (!el) {
    el = document.createElement("div");
    el.id = ID;
    document.body.appendChild(el);
  }

  const cssHref = "https://chat.globalmindsindia.com/global-chat-widget.css";
  if (!document.querySelector(`link[href="${cssHref}"]`)) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssHref;
    document.head.appendChild(link);
  }

  function load(src, cb) {
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = cb;
    document.head.appendChild(s);
  }

  function loadWidget() {
    const bundleUrl =
      "https://chat.globalmindsindia.com/global-chat-widget.umd.js";
    load(bundleUrl, () => {
      if (typeof window.initGlobalChat === "function") {
        window.initGlobalChat({ containerId: ID });
      }
    });
  }

  loadWidget();
})();
