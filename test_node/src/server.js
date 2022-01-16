import express from "express"
import bodyParser from "body-parser"
import cors from "cors"
//import morgan from "morgan"
import books from "./api/books.route"
import authors from "./api/authors.route"
import users from "./api/users.route"


const app = express()

app.use(cors())
    //process.env.NODE_ENV !== "prod" && app.use(morgan("dev"))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Register api routes
app.use("/books", books)
app.use("/authors", authors)
app.use("/user", users)

//app.use("/status", express.static("build"))
//app.use("/", express.static("build"))
app.use("*", (req, res) => res.status(404).json({ error: "not found" }))

export default app