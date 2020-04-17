const https = require("https");
const fs = require("fs");

https.get("https://api.citybik.es/v2/networks", (result) => {
  let body = "";
  result.on("data", (data) => (body += data.toString()));
  result.on("end", () => {
    const bodyData = JSON.parse(body);
    const v3network = bodyData.networks.find((network) => network.id === "v3-bordeaux");
    fetchV3Data(v3network.href);
  });
});

function fetchV3Data(href) {
  console.log(href);
  https.get(`https://api.citybik.es${href}`, (result) => {
    let body = "";
    result.on("data", (data) => (body += data.toString()));
    result.on("end", () => {
      const bodyData = JSON.parse(body);
      createStationsFiles(bodyData.network.stations);
    });
  });
}

function createStationsFiles(stations) {
  fs.mkdir("stations", () => {
    stations.map((station) => {
      fs.writeFile(`stations/${station.name}.json`, JSON.stringify(station), () => {
        console.log(`updated ${station.name}`);
      });
    });
  });
}
