const { JSDOM } = require("jsdom");

JSDOM.fromURL("http://localhost:5173", {
  runScripts: "dangerously",
  resources: "usable",
  pretendToBeVisual: true
}).then(dom => {
  dom.window.addEventListener('error', event => {
    console.error("JSDOM CAUGHT ERROR:", event.error);
  });
  
  dom.window.addEventListener('unhandledrejection', event => {
    console.error("JSDOM CAUGHT REJECTION:", event.reason);
  });
  
  const originalError = dom.window.console.error;
  dom.window.console.error = function() {
    console.log("JSDOM CONSOLE ERROR:", ...arguments);
    originalError.apply(dom.window.console, arguments);
  };

  setTimeout(() => {
    console.log("Finished waiting.");
    process.exit(0);
  }, 5000);
}).catch(e => {
  console.log("JSDOM Setup Error:", e);
});
