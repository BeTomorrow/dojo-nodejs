const https = require("https");
const fs = require("fs");
const http = require("http");
const util = require("util");

fetchBikeData();
setInterval(fetchBikeData, 60000);
createServer();

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const mkdir = util.promisify(fs.mkdir);

function fetchBikeData() {
  https.get("https://api.citybik.es/v2/networks", (result) => {
    let body = "";
    result.on("data", (data) => (body += data.toString()));
    result.on("end", () => {
      const bodyData = JSON.parse(body);
      const v3network = bodyData.networks.find((network) => network.id === "v3-bordeaux");
      fetchV3Data(v3network.href);
    });
  });
}

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

async function createStationsFiles(stations) {
  try {
    await mkdir("stations");
  } catch (e) {}
  await Promise.all(
    stations.map(async (station) => {
      await writeFile(`stations/${station.name}.json`, JSON.stringify(station));
      console.log(`updated ${station.name}`);
    })
  );
}

function createServer() {
  const server = http.createServer(async (request, result) => {
    const station = decodeURI(request.url.substring(1));
    console.log("Handling request to ", request.url);
    try {
      const data = await readFile(`stations/${station}.json`);
      result.write(data.toString());
    } catch (error) {
      result.statusCode = 404;
      result.write(error.toString());
    } finally {
      result.end();
    }
  });
  server.listen(8080);
}
