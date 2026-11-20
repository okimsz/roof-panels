(function () {
  window.roofFail = function (message) {
    const e = document.getElementById("startup");
    e.hidden = false;
    e.textContent =
      "The 3D house could not start. " +
      message +
      " Try Chrome or Edge with hardware acceleration enabled.";
  };
  window.addEventListener(
    "error",
    (e) => roofFail(e.message || "A required local script did not load."),
    true,
  );
  window.addEventListener("unhandledrejection", (e) =>
    roofFail(String(e.reason)),
  );
  setTimeout(() => {
    if (!window.roofReady)
      roofFail("Rendering is taking longer than expected.");
  }, 15000);
})();
