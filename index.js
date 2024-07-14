import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();
const dbPassword = process.env.DB_PASSWORD;

const app = express();
const port = 3000;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Postgres database configuration //
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: dbPassword,
  post: 5432
});
db.connect();

async function checkVisisted() {
  const data = await db.query("SELECT country_code FROM visited_countries");
  let countries = [];
  data.rows.forEach((country) => {
    countries.push(country.country_code);
  });
  return countries;
}

// HOME PAGE //
app.get("/", async (req, res) => {
  const countries = await checkVisisted();
  res.render("index.ejs" , {
    total: countries.length,
    countries: countries
  });
});

//Taking Input //
app.post("/add", async(req, res) => {
const input = req.body["country"];

  try { 
    const result = await db.query(
      "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';",
       [input.toLowerCase()]
      ); 

    const countryCode = result.rows[0].country_code;
    try {
      await db.query(
        "INSERT INTO visited_countries (country_code) VALUES ($1)",
        [countryCode]
      );
      res.redirect("/");
    } catch (err) {
      console.log(err);
      const countries = await checkVisisted();
      res.render("index.ejs", {
        countries: countries,
        total: countries.length,
        error: "Country has already been added, try again.",
      });
    }  
  } catch (err) {
    console.log(err);
    const countries = await checkVisisted();
    res.render("index.ejs", {
      countries: countries,
      total: countries.length,
      error: "Country name does not exist, try again.",
    })
  }  
});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
