const axios = require("axios");
const cheerio = require("cheerio");

/**
 * Función principal que se encarga de obtener los datos de las cartas
 * desde la página web de Union Arena TCG.
 */
async function main() {
  const url =
    "https://www.unionarena-tcg.com/na/cardlist/index.php?search=true";

  // Obtenemos la respuesta de la página web.
  const response = await axios.get(url);

  // Cargamos la respuesta en cheerio.
  const $ = cheerio.load(response.data);
  //console.log('response', response.data);

  const sets = [];

  // Obtenemos los sets de cartas.
  $("#selectTitle")
    .first()
    .find("option")
    .each((index, element) => {
      const set = $(element).attr("value");
      if (set === "") return;
      sets.push(set);
    });
  //console.log('sets', sets);

  const cards = [];

  // Obtenemos el listado de cartas de cada set.
  for (const set of sets) {
    const response = await axios.post(
      "https://www.unionarena-tcg.com/na/cardlist/index.php?search=true",
      {
        selectTitle: set,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const $2 = cheerio.load(response.data);

    // Obtenemos el detalle de cada carta.
    $2(".cardlistCol")
      .first()
      .find("li")
      .each(async (index, element) => {
        const linkCard = $(element).find("a").attr("href");
        const responseCardData = await axios.get(
          "https://www.unionarena-tcg.com/na/cardlist/" + linkCard
        );
        const $3 = cheerio.load(responseCardData.data);

        const numData = $3(".cardNumData").text().trim();
        const name = $3(".cardNameCol").text().trim();
        const affinity = $3(".attributeData .cardDataContents").text().trim();

        cards.push({
          numData,
          name,
          affinity,
        });
      });
  }

  console.log("cards", cards);
}

main();
