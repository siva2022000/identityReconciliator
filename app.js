const express = require('express');
const contactRoutes = require('./routes/contactRoutes')

const app = express();

app.use(express.json());

app.use('/', contactRoutes);

const PORT = 3000;
app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`)
})
