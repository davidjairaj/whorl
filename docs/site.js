"use strict";
const copyButton = document.getElementById("copy");
const notes = document.getElementById("report");
const status = document.getElementById("copy-status");
copyButton.hidden = false;
copyButton.addEventListener("click", async () => {
  try {
    if (!navigator.clipboard) throw new Error("Clipboard unavailable");
    await navigator.clipboard.writeText(notes.value);
    status.textContent = "Copied. Paste your notes into your conversation with David.";
  } catch {
    notes.focus();
    notes.select();
    status.textContent = "Select and copy the notes using your device’s Copy command.";
  }
});
