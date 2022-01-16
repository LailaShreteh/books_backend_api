import { Router } from "express"
import BooksCtrl from "./books.controller"

const router = new Router()

/* **GET /books/** - Returns a list of books in the database in JSON format**/
router.route('/').get(BooksCtrl.paginatedResults)
/* **GET /book/{{id}}/** - Returns a detail view of the specified book id. Nest author
    details in JSON format**/
router.route('/:book_isbn').get(BooksCtrl.apiGetBooksById)
    /** **POST /book/** - Creates a new book with the specified details - Expects a JSON body*/
router.route("/new").post(BooksCtrl.apiCreateBook)
    /* **PUT /book/{{id}}** - Updates an existing book - Expects a JSON body */
router.route("/update").put(BooksCtrl.save)

export default router