(async function () {
  require('dotenv').config();
  const Prompt = require('prompt-list');
  const MongoClient = require('mongodb').MongoClient;

  const mongoClient = new MongoClient('mongodb://localhost:27017');

  function prompt(name, message, choices = ["YES", "NO"], cb) {
    return new Promise((resolve, reject) => {
      new Prompt({
        name,
        message,
        choices,
      }).ask((answer) => {
        if (answer === choices[0])
          resolve(answer);
      })
    })
  }

  async function dropDatabase() {
    try {
      await mongoClient.db(process.env.DB_NAME).dropDatabase();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  await prompt(
    'confirm-delete-db',
    `DELETE DB: ${process.env.DB_NAME}?`,
    ['YES', 'NO'],
  ).then(dropDatabase)
    .finally(() => mongoClient.close());

})()