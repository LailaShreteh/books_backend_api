import { ObjectId } from "bson";

let books;
let authors;
const DEFAULT_SORT = [["tomatoes.viewer.numReviews", -1]];

export default class booksDAO {
  static async injectDB(conn) {
    if (books && authors) {
      return;
    }
    try {
      books = await conn.db(process.env.BOOKS_NS).collection("Books");
      authors = await conn.db(process.env.BOOKS_NS).collection("Authors");

      this.books = books; // this is only for testing
    } catch (e) {
      console.error(
        `Unable to establish a collection handle in booksDAO: ${e}`
      );
    }
  }
  /**
   * Finds and returns all books .
   * Returns a list of objects, each object contains a user_id, name and club.
   * @param {Object} filters - The search parameters to use in the query.
   * @param {number} page - The page of books to retrieve.
   * @param {number} booksPerPage - The number of books to display per page.
   * @returns {GetBooksResult} An object with user results and total results
   * that would match this query
   */
  static async getBooks(
    // here's where the default parameters are set for the getBooks method
    filters = null,
    page,
    booksPerPage
  ) {
    let queryParams = {};
    if (filters) {
      if ("text" in filters) {
        queryParams = this.textSearchQuery(filters["text"]);
      } else if ("cast" in filters) {
        queryParams = this.castSearchQuery(filters["cast"]);
      } else if ("genre" in filters) {
        queryParams = this.genreSearchQuery(filters["genre"]);
      }
    }

    let { query = {}, project = {}, sort = DEFAULT_SORT } = queryParams;
    let cursor;
    try {
      cursor = await books.find(query).project(project).sort(sort);
    } catch (e) {
      console.error(`Unable to issue find command, ${e}`);
      return {
        booksList: [],
        totalNumBooks: await books.countDocuments(query),
      };
    }
    /**
        Ticket: Paging

        Before this method returns back to the API, use the "booksPerPage" and
        "page" arguments to decide the books to display.

        Paging can be implemented by using the skip() and limit() cursor methods.
        */

    // Use the cursor to only return the books that belong on the current page
    //project here !
    const displayCursor = cursor.limit(booksPerPage);
    if (page) {
      const displayCursor = cursor
        .skip(page * booksPerPage)
        .limit(booksPerPage);
    }
    try {
      const booksList = await displayCursor.toArray();

      const totalNumBooks = page === 0 ? await books.countDocuments() : 0;
      const estimate = await books.estimatedDocumentCount();
      // console.log(`Estimated number of documents in the movies collection: ${estimate}`);
      return { booksList, totalNumBooks: estimate };
    } catch (e) {
      console.error(
        `Unable to convert cursor to array or problem counting documents, ${e}`
      );
      return { booksList: [], totalNumBooks: estimate };
    }
  }
  // manual refrance !
  static async getNestedDocsByID() {
    let cursor
    try {
      // Implement the required pipeline.
      const pipeline = [
        {
            $unwind: {
                path: '$author_id'
            }
        },
        {
            $lookup: {
                from: 'Authors',
                localField: 'author_id',
                foreignField: '_id',
                as: 'author_id'
            }
        },
         {
            $unwind: {
                path: '$author_id'
            }
        },
         {
            $group: {
                _id: '$_id',
                authors_: {
                    $push: '$author_id'
                }
            }
        },
         {
            $lookup: {
                from: 'Books',
                localField: '_id',
                foreignField: '_id',
                as: 'authors_details'
            }
        },
        {
            $unwind: {
                path: '$authors_details'
            }
        },
        {
            $addFields: {
                'authors_details.author_id': '$authors_'
            }
        },
        {
            $replaceRoot: {
                newRoot: '$authors_details'
            }
        }
    ]
      const totalNumBooks = 0 === 0 ? await books.countDocuments() : 0;

      cursor = await books.aggregate(pipeline)
      const booksList = await cursor.toArray()
      return {booksList,total:totalNumBooks}
    } catch (e) {
      /**
      Ticket: Error Handling

      Handle the error that occurs when an invalid ID is passed to this method.
      When this specific error is thrown, the method should return `null`.
      */

      // TODO Ticket: Error Handling
      // Catch the InvalidId error by string matching, and then handle it.
      console.error(`Something went wrong in getUserByID: ${e}`)
      throw e
    }
  }
    /*
    let cursor;
    console.log("lailaaaaaaaaaaaaaaaa");
    try {
      const pipeline_ = [
        {
          $lookup: {
            from: "Authors",
            let: { author_id_: "$author_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: ["$$author_id_", ["61df89b2369b34382d13c23c"]],
                  },
                },
              },
            ],
            as: "author_name_list",
          },
        }
      ];
      cursor = await books.aggregate([
        {
            $unwind: {
                path: '$author_id'
            }
        },
        {
            $lookup: {
                from: 'Authors',
                localField: 'author_id._id',
                foreignField: '_id',
                as: 'author_id.author_obj'
            }
        },
        {
            $unwind: {
                path: '$author_id.author_obj'
            }
        },
        {
            $group: {
                _id: '$_id',
                products: {
                    $push: '$author_id'
                }
            }
        },
        {
            $lookup: {
                from: 'Books',
                localField: '_id',
                foreignField: '_id',
                as: 'orderDetails'
            }
        },
        {
            $unwind: {
                path: '$orderDetails'
            }
        },
        {
            $addFields: {
                'orderDetails.author_id': '$author_id'
            }
        },
        {
            $replaceRoot: {
                newRoot: '$orderDetails'
            }
        }
    ])
        /*[{
        $lookup: {
          from: "Authors", // other table name
          localField: "author_id", // name of users table field
          foreignField: "_id", // name of userinfo table field
          as: "authors_name" // alias for userinfo table
        }
      },]) // $unwind used for getting data in object or for one record only);
      */
      // return cursor.toArray();
    // } catch (e) {
      // /**
            // Ticket: Error Handling
// 
            // Handle the error that occurs when an invalid ID is passed to this method.
            // When this specific error is thrown, the method should return `null`.
            // */
// 
    //  TODO Ticket: Error Handling
     // Catch the InvalidId error by string matching, and then handle it.
      // console.error(`Something went wrong in getBookByID: ${e}`);
      // throw e;
    // }
  // }
// /
  static async getBooksByISBN(isbn) {
    /**
        Ticket: Projection
        Remember that in MongoDB, the $in operator can be used with a list to
        match one or more values of a specific field.
        */
    let cursor;
    try {
      // TODO Ticket: Projection
      // Find books matching the "ids" list
      // Do not put a limit in your own implementation, the limit
      // here is only included to avoid sending 46000 documents down the
      // wire.
      cursor = await books.find(
        { isbn: { $in: isbn } },
        { projection: { _id: 0, isbn: 1, title: 1, subtitle: 1, published: 1 } }
      );
    } catch (e) {
      console.error(`Unable to issue find command, ${e}`);
      return [];
    }

    return cursor.toArray();
  }

  static async getBookByISBN(isbn) {
    try {
      /**
            Ticket: Get Comments

            Given a user ID, build an Aggregation Pipeline to retrieve the comments
            matching that user's ID.

            The $match stage is already completed. You will need to add a $lookup
            stage that searches the `comments` collection for the correct comments.
            */

      // TODO Ticket: Get Comments
      // Implement the required pipeline.
      const pipeline = [
        {
          $match: {
            isbn: isbn,
          },
        },
      ];
      // to do nested here !
      return await books.aggregate(pipeline).next();
    } catch (e) {
      /**
            Ticket: Error Handling

            Handle the error that occurs when an invalid ID is passed to this method.
            When this specific error is thrown, the method should return `null`.
            */

      // TODO Ticket: Error Handling
      // Catch the InvalidId error by string matching, and then handle it.
      console.error(`Something went wrong in getBookByISBN: ${e}`);
      throw e;
    }
  }

  /**
   * Adds a book to the `books` collection
   * @param {BookInfo} bookInfo - The information of the book to add
   * @returns {DAOResponse} Returns either a "success" or an "error" Object
   */
  static async addBook(bookInfo) {
    /**
        Ticket: Durable Writes

        Please increase the durability of this method by using a non-default write
        concern with ``insertOne``.
        */
    try {
      // TODO Ticket: Book Management
      // Insert a book with the "name", "email", and "password" fields.
      // TODO Ticket: Durable Writes
      // Use a more durable Write Concern for this operation.
      await books.insertOne({
        isbn: bookInfo.isbn,
        title: bookInfo.title,
        author_id: bookInfo.author_id,
      });
      return { success: true };
    } catch (e) {
      if (String(e).startsWith("MongoError: E11000 duplicate key error")) {
        return { error: "A book with the given isbn already exists." };
      }
      console.error(`Error occurred while adding new book, ${e}.`);
      return { error: e };
    }
  }

  static async getBook(isbn) {
    return await books.findOne({ isbn: isbn });
  }

  /**
   * Given a book's isbn and an object of new preferences, update that book's
   * data to include those preferences.
   * @param {string} isbn - The isbn of the book to update.
   * @param {Object} title - The title to include in the book's data.
   * @param {Object} author_id - The author_id to include in the book's data.
   * @returns {DAOResponse}
   */
  static async updateBook(isbn, title, author_id) {
    try {
      title = title || {};
      author_id = author_id || {};

      const updateResponse = await books.updateOne(
        { isbn: isbn },
        { $set: { title: title, author_id: author_id } }
      );

      // todo also change the autherId!
      if (updateResponse.matchedCount === 0) {
        return { error: "No book found with that isbn" };
      }
      return updateResponse;
    } catch (e) {
      console.error(
        `An error occurred while updating this book's title or author_id, ${e}`
      );
      return { error: e };
    }
  }
}
