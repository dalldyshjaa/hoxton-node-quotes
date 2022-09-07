import express from "express";
import cors from "cors";
const app = express();
const port = 4000;

type Quote = {
  age: number;
  name: string;
  lastName: string;
  id: number;
  quote: string;
};

import Database from "better-sqlite3";

const db = Database("./db/data.db", { verbose: console.log });

app.use(cors());
app.use(express.json());

let data: Quote[] = [
  {
    id: 1,
    age: 21,
    name: "Titus Maccius",
    lastName: "Plautus",
    quote:
      "If you have overcome your inclination and not been overcome by it, you have reason to rejoice.",
  },
  {
    id: 2,
    age: 31,
    name: "Julius",
    lastName: "Caesar",
    quote:
      "If you must break the law, do it to seize power: in all other cases observe it.",
  },
  {
    id: 3,
    age: 41,
    name: "Publius Vergalius",
    lastName: "Maro",
    quote: "Fear is proof of a degenerate mind.",
  },
];

const createQuotesTable =
  db.prepare(`CREATE TABLE IF NOT EXISTS quotes ( id INTEGER NOT NULL,
  name TEXT NOT NULL,
  lastName TEXT NOT NULL,
  age INTEGER NOT NULL, 
  quote TEXT NOT NULL,
  PRIMARY KEY (id));
  `);

createQuotesTable.run();

const createQuote = db.prepare(
  `INSERT INTO quotes (name, lastName, age, quote) VALUES (?, ?, ?, ?);`
);

const getAllQuotes = db.prepare(`SELECT * FROM quotes;`);

const getAQuote = db.prepare(`SELECT * FROM quotes WHERE id = ?;`);

const deleteQuote = db.prepare(`DELETE FROM quotes WHERE id = ?`);

const updateQuote = db.prepare(
  `UPDATE quotes  SET name = ?, lastName = ?, age = ?, quote = ? WHERE id = ?`
);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/quotes", (req, res) => {
  res.send(getAllQuotes.all());
});

app.get("/quotes/:id", (req, res) => {
  const quote = getAQuote.all(Number(req.params.id));
  res.send(quote);
});

app.post("/quotes", (req, res) => {
  let errors = [];
  if (typeof req.body.age !== "number") {
    errors.push("The age is not a number or doesn't exist");
  }
  if (typeof req.body.name !== "string") {
    errors.push("The name is not a string or doesn't exist");
  }

  if (typeof req.body.lastName !== "string") {
    errors.push("The Last name is not a string or doesn't exist");
  }

  if (typeof req.body.quote !== "string") {
    errors.push("The quote is not a string or doesn't exist");
  }
  if (errors.length === 0) {
    createQuote.run(
      req.body.name,
      req.body.lastName,
      req.body.age,
      req.body.quote
    );
    res.send(req.body);
  } else {
    res.status(400).send({ errors: errors });
  }
});

app.delete("/quotes/:id", (req, res) => {
  deleteQuote.run(Number(req.params.id));
});

app.patch("/quotes/:id", (req, res) => {
  let quote = getAQuote.all(Number(req.params.id))[0];
  res.send(quote);
  if (quote.length) {
    if (req.body.age) {
      //@ts-ignore
      quote.age = req.body.age;
    }
    if (req.body.name) {
      //@ts-ignore
      quote.name = req.body.name;
    }
    if (req.body.lastName) {
      //@ts-ignore
      quote.lastName = req.body.lastName;
    }
    if (req.body.quote) {
      //@ts-ignore
      quote.quote = req.body.quote;
    }
    //@ts-ignore
    updateQuote.run(
      //@ts-ignore
      quote.name,
      //@ts-ignore
      quote.lastName,
      //@ts-ignore
      quote.age,
      //@ts-ignore
      quote.quote,
      //@ts-ignore
      quote.id
    );
    res.send(quote);
  } else {
    res.status(404).send({ error: "Not Found" });
  }
});

app.put("/quotes/:id", (req, res) => {
  let match = data.find((quote) => quote.id === Number(req.params.id));

  if (match) {
    match = req.body;
    res.send(match);
  } else {
    res.status(404).send({ error: "Not Found" });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
