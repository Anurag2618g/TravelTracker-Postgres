import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "chained_86",
  post: 5432
});

db.connect();

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// HOME PAGE //
app.get("/", async (req, res) => {
  const data = await db.query("SELECT country_code FROM visited_countries");
  let countries = [];
  data.rows.forEach((country) => {
    countries.push(country.country_code);
  });

  res.render("index.ejs" , {
    total: countries.length,
    countries: countries
  });
});

app.post("/add", async(req, res) => {
  const input = req.body["country"];

  const result = await db.query("SELECT country_code FROM countries WHERE country_name = $1", [input]);
  
  if (result.rows.length !== 0) {
    const countryCode = result.rows[0].country_code;

    await db.query("INSERT INTO visited_countries (country_code) VALUES ($1)",[countryCode]);
    res.redirect("/");
  }
});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
