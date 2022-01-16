import { Router } from "express";
import AuthorsCtrl from "./authors.controller";

const router = new Router();

/* **GET /authors/** - Returns a list of authors in the database in JSON format*/
router.route("/").get(AuthorsCtrl.paginatedResults);
/***GET /author/{{id}}/** - Returns a detail view of the specified author id**/
router.route("/:author_id").get(AuthorsCtrl.apiGetAuthorById);
/* **POST /author/** - Creates a new author with the specified details - Expects a
    JSON body**/
router.route("/new").post(AuthorsCtrl.apiCreateAuthor);
/* **PUT /author/{{id}}** - Updates an existing author - Expects a JSON body
 */
router.route("/update").put(AuthorsCtrl.save);
export default router;