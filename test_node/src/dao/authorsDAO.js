import { ObjectId } from "bson"

let authors
const DEFAULT_SORT = [
    ["tomatoes.viewer.numReviews", -1]
]

export default class AuthorsDAO {
    static async injectDB(conn) {
            if (authors) {
                return
            }
            try {
                authors = await conn.db(process.env.BOOKS_NS).collection("Authors")
                this.authors = authors // this is only for testing
            } catch (e) {
                console.error(
                    `Unable to establish a collection handle in authorsDAO: ${e}`,
                )
            }
        }
        /**
         * Finds and returns all authors .
         * Returns a list of objects, each object contains a user_id, name and club.
         * @param {Object} filters - The search parameters to use in the query.
         * @param {number} page - The page of authors to retrieve.
         * @param {number} authorsPerPage - The number of authors to display per page.
         * @returns {GetAuthorsResult} An object with user results and total results
         * that would match this query
         */
    static async getAuthors(
        // here's where the default parameters are set for the getAuthors method
        filters = null,
        page,
        authorsPerPage,
    ) {
        let queryParams = {}
        if (filters) {
            if ("text" in filters) {
                queryParams = this.textSearchQuery(filters["text"])
            } else if ("cast" in filters) {
                queryParams = this.castSearchQuery(filters["cast"])
            } else if ("genre" in filters) {
                queryParams = this.genreSearchQuery(filters["genre"])
            }
        }

        let { query = {}, project = { _id: 1, first_name: 1, last_name: 1 }, sort = DEFAULT_SORT } = queryParams
        let cursor
        try {
            cursor = await authors
                .find(query)
                .project(project)
                .sort(sort)
        } catch (e) {
            console.error(`Unable to issue find command, ${e}`)
            return { authorsList: [], totalNumAuthors: await authors.countDocuments(query) }
        }

        /**
        Ticket: Paging

        Before this method returns back to the API, use the "authorsPerPage" and
        "page" arguments to decide the authors to display.

        Paging can be implemented by using the skip() and limit() cursor methods.
        */

        // Use the cursor to only return the authors that belong on the current page
        const displayCursor = cursor.limit(authorsPerPage)
        if (page) {
            const displayCursor = cursor.skip(page * authorsPerPage).limit(authorsPerPage)
        }
        try {
            const authorsList = await displayCursor.toArray()
            const totalNumAuthors = page === 0 ? await authors.countDocuments() : 0
            const estimate = await authors.estimatedDocumentCount();
            // console.log(`Estimated number of documents in the movies collection: ${estimate}`);

            return { authorsList, totalNumAuthors: estimate }
        } catch (e) {
            console.error(
                `Unable to convert cursor to array or problem counting documents, ${e}`,
            )
            return { authorsList: [], totalNumAuthors: estimate }
        }
    }

    static async getAuthorByID(id) {
        try {
            /**
            Ticket: Get Comments

            Given an author ID, build an Aggregation Pipeline to retrieve the comments
            matching that author's ID.

            The $match stage is already completed. You will need to add a $lookup
            stage that searches the `comments` collection for the correct comments.
            */

            // Implement the required pipeline.
            const pipeline = [{
                $match: {
                    _id: ObjectId(id)
                }
            }]
            return await authors.aggregate(pipeline).next()
        } catch (e) {
            /**
            Ticket: Error Handling

            Handle the error that occurs when an invalid ID is passed to this method.
            When this specific error is thrown, the method should return `null`.
            */

            // TODO Ticket: Error Handling
            // Catch the InvalidId error by string matching, and then handle it.
            console.error(`Something went wrong in getAuthorByID: ${e}`)
            throw e
        }
    }

    static async getAuthorsByNames(first_name) {
        try {
            // TODO Ticket: Author Management
            // Retrieve the session document corresponding with the author's first_name.
            return sessions.findOne({ first_name: first_name })
        } catch (e) {
            console.error(`Error occurred while retrieving author session, ${e}`)
            return null
        }
    }
    static async addAuthor(authorInfo) {
        /**
        Ticket: Durable Writes

        Please increase the durability of this method by using a non-default write
        concern with ``insertOne``.
        */
        try {

            await authors.insertOne({ first_name: authorInfo.first_name, last_name: authorInfo.last_name })
            return { success: true }
        } catch (e) {
            if (String(e).startsWith("MongoError: E11000 duplicate key error")) {
                return { error: "A author with the given name already exists." }
            }
            console.error(`Error occurred while adding new author, ${e}.`)
            return { error: e }
        }
    }

    static async getAuthor(first_name, last_name) {
            return await authors.findOne({ first_name: first_name, last_name: last_name })
        }
        /**
         * Given a book's isbn and an object of new preferences, update that book's
         * data to include those preferences.
         * @param {Object} first_name - The title to include in the book's data.
         * @param {Object} last_name - The author_id to include in the book's data.
         * @returns {DAOResponse}
         */
    static async updateBook(id, first_name, last_name) {
        try {
            first_name = first_name || {}
            last_name = last_name || {}

            const updateResponse = await books.updateOne({ _id: ObjectId(id) }, { $set: { first_name: first_name, last_name: last_name } }, )

            if (updateResponse.matchedCount === 0) {
                return { error: "No book found with that isbn" }
            }
            return updateResponse
        } catch (e) {
            console.error(
                `An error occurred while updating this book's title or author_id, ${e}`,
            )
            return { error: e }
        }
    }
    static async getAuthorsByIds(ids) {
        /**
        Ticket: Projection
    
        Write a query that matches users with the ids in the "ids"
        list, but only returns user_id, name, club of each user.
    
        Remember that in MongoDB, the $in operator can be used with a list to
        match one or more values of a specific field.
        */
        let cursor
        try {
          // TODO Ticket: Projection
          // Find users matching the "ids" list
          // Do not put a limit in your own implementation, the limit
          // here is only included to avoid sending 46000 documents down the
          // wire.
          cursor = await authors.find({'_id': {$in: Object.values(ids)}},
          {projection: { _id: 0,first_name: 1, last_name: 1 }})
    
        } catch (e) {
          console.error(`Unable to issue find command, ${e}`)
          return []
        }
    
        return cursor.toArray()
      }
}