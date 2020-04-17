const https = require("https");

https.get("https://api.citybik.es/v2/networks", (result) => {
  let body = "";
  result.on("data", (data) => (body += data.toString()));
  result.on("end", () => {
    const bodyData = JSON.parse(body);
    const v3network = bodyData.networks.find((network) => network.id === "v3-bordeaux");
    console.log(v3network);
  });
});
