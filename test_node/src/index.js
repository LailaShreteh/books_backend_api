import app from "./server"
import { MongoClient } from "mongodb"
import BooksDAO from "../src/dao/booksDAO"
import AuthorsDAO from "../src/dao/authorsDAO"
import UsersDAO from "./dao/usersDAO"


const port = process.env.PORT || 8000
const host = process.env.HOST
    /**
    Ticket: Connection Pooling

    Please change the configuration of the MongoClient object by setting the
    maximum connection pool size to 50 active connections.
    */

/**
Ticket: Timeouts

Please prevent the program from waiting indefinitely by setting the write
concern timeout limit to 2500 milliseconds.
*/

MongoClient.connect(
        process.env.MONGO_DB_URI,
        // TODO: Connection Pooling
        // Set the poolSize to 50 connections.
        // TODO: Timeouts
        // Set the write timeout limit to 2500 milliseconds.
        { useNewUrlParser: true },
    )
    .catch(err => {
        console.error(err.stack)
        process.exit(1)
    })
    .then(async client => {
        // await MoviesDAO.injectDB(client)
        await BooksDAO.injectDB(client)
        await AuthorsDAO.injectDB(client)
        await UsersDAO.injectDB(client)
        app.listen(port, host, async() => {
            console.log(`listening on port ${port}`)
        })
    })