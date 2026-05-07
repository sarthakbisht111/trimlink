const express = require('express')
const path = require('path')
const cookieParser = require("cookie-parser")
const {connectToMongoDB} = require('./connect')
const {restrictToLoggedInUserOnly,checkAUth} = require("./middleware/auth")
const URL = require('./models/url')

const urlRouter = require("./routes/url")
const staticRoute = require("./routes/statisRouter")
const userRoute = require("./routes/user")

const app = express()
const PORT = process.env.PORT || 8000

require('dotenv').config()

connectToMongoDB(process.env.MONGO_URI).then(()=> console.log("MongoDB connected")
)

app.set("view engine", "ejs")
app.set('views', path.resolve("./views"))

app.use(express.json()) 
app.use(express.urlencoded({extended: false})) 
app.use(cookieParser())



app.use("/url", restrictToLoggedInUserOnly,urlRouter)
app.use("/user", userRoute)
app.use("/", checkAUth,staticRoute)

app.get('/url/:shortId', async (req,res) => {
    const shortId = req.params.shortId;
    const entry = await URL.findOneAndUpdate(
        {
            shortId,
        },
        {
            $push: {
                visitHistory: {
                    timestamp : Date.now()
                }
            }
        }
    )
    if(!entry) return res.status(404).json("Short URL not found")
    return res.redirect(entry.redirectURL)
})

app.listen(PORT, () => console.log(`Server started at PORT ${PORT}`))
