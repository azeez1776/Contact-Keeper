const express = require("express"); // node uses the commonjs module, hence uses require and not import which is used in ES2015 modules.
const connectDB = require("./config/db");

const app = express();

const port = process.env.PORT || 5000;
connectDB();

app.use(express.json({ extended: false }));

app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/contacts', require('./routes/contacts'));


app.get('/', (req, res) => {
    res.json({ name: "abdi" });
})


app.listen(port, () => {
    console.log(`Listening in port ${port}`)
})