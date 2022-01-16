import AuthorsDAO from "../dao/authorsDAO";
import BooksDAO from "../dao/booksDAO";

export class Book {
  constructor({ isbn, title, author_id } = {}) {
    this.isbn = isbn;
    this.title = title;
    this.author_id = author_id;
  }
  toJson() {
    return { isbn: this.isbn, title: this.title, author_id: this.author_id };
  }
}
export default class BooksController {
  static async paginatedResults(req, res, next) {
    const BOOKS_PER_PAGE = 10;
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit) == "" ? "" : BOOKS_PER_PAGE;
    const skipIndex = (page - 1) * limit;
    const results = {};

    const { booksList, totalNumBooks } = await BooksDAO.getBooks(
      null,
      page,
      limit
    );
    // // now get authorsNames
    // let booksList = await booksList_.forEach(async (value) => {
    //   let ids = value.author_id;
    //   const authorsList =  await AuthorsDAO.getAuthorsByIds(ids);
    //   value.author_id = authorsList;
    //   console.log(value.author_id )
    // })
    
    let response = {
      books: booksList,
      page: page,
      filters: {},
      entries_per_page: BOOKS_PER_PAGE,
      total_results: totalNumBooks,
    };
    res.json(response);
  }

  static async apiCreateBook(req, res) {
    try {
      const bookFromBody = req.body;
      let errors = {};
      if (bookFromBody && bookFromBody.title.length < 4) {
        errors.password = "Your title must be at least 4 characters.";
      }
      if (Object.keys(errors).length > 0) {
        res.status(400).json(errors);
        return;
      }

      const insertResult = await BooksDAO.addBook(bookFromBody);

      if (!insertResult.success) {
        errors.email = insertResult.error;
      }

      const bookFromDB = await BooksDAO.getBook(bookFromBody.isbn);
      if (!bookFromDB) {
        errors.general = "Internal error, please try again later";
      }
      if (Object.keys(errors).length > 0) {
        res.status(400).json(errors);
        return;
      }

      const book = new Book(bookFromDB);

      res.json({ book, result: "added successfully" });
    } catch (e) {
      res.status(500).json({ error: e });
    }
  }

  static async apiGetBooksByIds(req, res, next) {
    let ids = req.query.ids == "" ? "" : req.body.book_ids;
    let idsList = Array.isArray(ids) ? ids : Array(ids);
    let booksList = await BooksDAO.getBooksByIds(idsList);
    let response = {
      titles: booksList,
    };
    res.json(response);
  }

  static async apiGetBooksById(req, res, next) {
    try {
      let id = req.params.book_isbn || {};
      let book = await BooksDAO.getBookByISBN(id);
      if (!book) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      // let updated_type = book.lastupdated instanceof Date ? "Date" : "other"
      res.json({ book });
    } catch (e) {
      console.log(`api, ${e}`);
      res.status(500).json({ error: e });
    }
  }

  static async getConfig(req, res, next) {
    const { poolSize, wtimeout, authInfo } = await BooksDAO.getConfiguration();
    try {
      let response = {
        pool_size: poolSize,
        wtimeout,
        ...authInfo,
      };
      res.json(response);
    } catch (e) {
      res.status(500).json({ error: e });
    }
  }
  static async save(req, res) {
    try {
      await BooksDAO.updateBook(
        req.body.isbn,
        req.body.title,
        req.body.author_id
      );
      const bookFromDB = await BooksDAO.getBook(req.body.isbn);
      const updatedBook = new Book(bookFromDB);

      res.json({ result: "updated successfully" });
    } catch (e) {
      res.status(500).json(e);
    }
  }
}
