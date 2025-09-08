(function () {
  const ID = "globalminds-chatbot";

  // Inject container div if not present
  let el = document.getElementById(ID);
  if (!el) {
    el = document.createElement("div");
    el.id = ID;
    document.body.appendChild(el);
  }

  // Helper to load scripts
  function load(src, cb) {
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = cb;
    document.head.appendChild(s);
  }

  // Load React/ReactDOM if needed
  const needReact = !window.React || !window.ReactDOM;
  if (needReact) {
    load("https://unpkg.com/react@18/umd/react.production.min.js", () =>
      load(
        "https://unpkg.com/react-dom@18/umd/react-dom.production.min.js",
        loadWidget
      )
    );
  } else {
    loadWidget();
  }

  // Load widget bundle and initialize
  function loadWidget() {
    load(
      "https://chat.globalmindsindia.com/dist/global-chat-widget.umd.js",
      () => window.initGlobalChat && window.initGlobalChat()
    );
  }
})();
