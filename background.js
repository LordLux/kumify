chrome.commands.onCommand.addListener((command) => {
    if (command === "toggle") {
      // Send a "toggleImages" message to the active tab in the current window
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, { action: "toggleImages" });
        }
      });
    }
  });
  