const axios = require("axios");

module.exports = {
  config: {
    name: "uid",
    version: "5.2",
    author: "Washiq Adnan",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Get Facebook UID" },
    description: { en: "Extract Facebook UID from profile/share link" },
    category: "info",
    guide: { en: "{pn} <facebook link>" }
  },

  onStart: async function ({ message, args }) {
    if (!args[0]) return message.reply("Usage: uid <facebook link>");

    const link = args.join(" ");

    const validDomains = [
      "facebook.com",
      "fb.com",
      "fb.watch",
      "m.facebook.com",
      "mbasic.facebook.com",
      "web.facebook.com"
    ];
    if (!validDomains.some(d => link.includes(d))) {
      return message.reply("Please provide a valid Facebook link.");
    }

    const requestConfig = {
      timeout: 15000,
      headers: { "User-Agent": "Mozilla/5.0" }
    };

    const extractId = (data) => {
      if (!data) return null;

      // If API returns string/HTML, don't crash
      if (typeof data === "string") return null;

      return data.id || data.uid || data.user_id || data.profile_id || null;
    };

    const providers = [
      (u) => `https://api.vyturex.com/facebook/id?url=${encodeURIComponent(u)}`,
      (u) => `https://id.traodoisub.com/api.php?link=${encodeURIComponent(u)}`,
      // Extra fallback (often works):
      (u) => `https://api.shrtco.de/v2/shorten?url=${encodeURIComponent(u)}` // just an example endpoint check (remove if you don't want)
    ];

    // NOTE: replace the 3rd provider with a real UID API if you have one.
    // I left it as a placeholder so you can see how to add more.

    for (let i = 0; i < providers.length; i++) {
      const url = providers[i](link);
      try {
        const res = await axios.get(url, requestConfig);
        const id = extractId(res.data);
        if (id) return message.reply(`UID: ${id}`);
      } catch (err) {
        // Continue to next provider
        const status = err?.response?.status;
        const code = err?.code;
        // optional debug:
        // console.log("UID API failed:", url, status, code);
        if (i === providers.length - 1) {
          return message.reply(
            `Server error.\nDetails: ${status ? `HTTP ${status}` : ""}${code ? ` ${code}` : ""}\nTry again later.`
          );
        }
      }
    }

    return message.reply("Unable to extract UID from this link.");
  }
};
