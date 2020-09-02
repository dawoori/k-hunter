const axios = require("axios");

axios({
  method: "post",
  url: process.env.WEBHOOKS,
  data: {
    text: 'Hello, World!',
  },
});
