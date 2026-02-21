const axios = require("axios");

module.exports = {
  config: {
    name: "uid",
    version: "5.1",
    author: "Washiq Adnan",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Get Facebook UID"
    },
    description: {
      en: "Extract Facebook UID from profile/share link"
    },
    category: "info",
    guide: {
      en: "{pn} <facebook link>\nReply to a user to get their UID\nNo link = your own UID"
    }
  },

  onStart: async function ({ message, event, args }) {

    // If replying to someone
    if (event.messageReply) {
      return message.reply(`UID: ${event.messageReply.senderID}`);
    }

    // If no argument, return own UID
    if (!args[0]) {
      return message.reply(`UID: ${event.senderID}`);
    }

    const link = args.join(" ");

    // Validate Facebook domains
    const validDomains = [
      "facebook.com",
      "fb.com",
      "fb.watch",
      "m.facebook.com",
      "mbasic.facebook.com",
      "web.facebook.com"
    ];

    const isValid = validDomains.some(domain => link.includes(domain));

    if (!isValid) {
      return message.reply("Please provide a valid Facebook link.");
    }

    const requestConfig = {
      timeout: 10000,
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    };

    const extractId = (data) => {
      if (!data) return null;
      return data.id || data.uid || data.user_id || null;
    };

    try {
      // Primary API
      const res = await axios.get(
        `https://api.vyturex.com/facebook/id?url=${encodeURIComponent(link)}`,
        requestConfig
      );

      const id1 = extractId(res.data);
      if (id1) return message.reply(`UID: ${id1}`);

      throw new Error("Primary API failed");

    } catch (error) {
      try {
        // Backup API
        const res2 = await axios.get(
          `https://id.traodoisub.com/api.php?link=${encodeURIComponent(link)}`,
          requestConfig
        );

        const id2 = extractId(res2.data);
        if (id2) return message.reply(`UID: ${id2}`);

        return message.reply("Unable to extract UID from this link.");

      } catch (err) {
        return message.reply("Server error. Please try again later.");
      }
    }
  }
};
