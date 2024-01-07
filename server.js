const express = require("express");
const app = express();
const PORT = process.env.PORT || 8000;
const { MongoClient } = require("mongodb");
// const { default: articles } = require('./client/src/pages/ArticleContent');
const path = require("path");

app.use(express.json({ extended: false }));

app.use(express.static(path.join(__dirname, "./client/build")));

app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build/index.html"));
});

const withDb = async (operations, res) => {
  try {
    const client = await MongoClient.connect(
      "mongodb+srv://amanchourasia2002:Aman123@cluster0.14ugbsi.mongodb.net/"
    );
    const db = client.db("mernblog");
    await operations(db);
    client.close();
  } catch (error) {
    res.status(500).json({ message: "Error Connecting to database", error });
  }
};

app.get("/api/articles/:name", async (req, res) => {
  withDb(async (db) => {
    const articleName = req.params.name;
    const articleInfo = await db
      .collection("articles")
      .findOne({ name: articleName });
    res.status(200).json(articleInfo);
  }, res);
});

app.post("/api/articles/:name/add-comments", (req, res) => {
  const { username, text } = req.body;
  const articleName = req.params.name;
  withDb(async (db) => {
    const articleInfo = await db
      .collection("articles")
      .findOne({ name: articleName });
    await db.collection("articles").updateOne(
      { name: articleName },
      {
        $set: {
          comments: articleInfo.comments.concat({ username, text }),
        },
      }
    );
    const updateArticleInfo = await db
      .collection("articles")
      .findOne({ name: articleName });
    res.status(200).json(updateArticleInfo);
  }, res);
});

app.listen(PORT, (err) =>
  err ? console.log(err) : console.log(`Server running on port ${PORT}`)
);
