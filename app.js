const express = require('express');
const sequelize = require('./config/database');
const contactRoutes = require('./routes/contactRoutes')

const app = express();

sequelize
  .sync({ force: false })
  .then(() => {
    console.log("Database synchronized");
  })
  .catch((err) => {
    console.error("Unable to synchronize the database:", err);
  });

app.use(express.json());

app.use('/', contactRoutes);

const PORT = 3000;
app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`)
})
