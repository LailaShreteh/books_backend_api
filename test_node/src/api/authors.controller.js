import AuthorsDAO from "../dao/authorsDAO"
export class Author {
    constructor({ first_name, last_name } = {}) {
        this.first_name = first_name
        this.last_name = last_name
    }
    toJson() {
        return { first_name: this.first_name, last_name: this.last_name }
    }
}
export default class AuthorsController {
    static async paginatedResults(req, res, next) {
        const AUTHORS_PER_PAGE = 10
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit) == "" ? "" : AUTHORS_PER_PAGE;
        const skipIndex = (page - 1) * limit;
        const results = {};

        const { authorsList, totalNumAuthors } = await AuthorsDAO.getAuthors(null, page, limit)
        let response = {
            authors: authorsList,
            page: page,
            filters: {},
            entries_per_page: AUTHORS_PER_PAGE,
            total_results: totalNumAuthors,
        }
        res.json(response)
    }

    static async apiGetAuthorsByIds(req, res, next) {
        let ids = req.query.ids == "" ? "" : req.body.author_ids
        let idsList = Array.isArray(ids) ? ids : Array(ids)
        let authorsList = await AuthorsDAO.getAuthorsByIds(idsList)
        let response = {
            titles: authorsList,
        }
        res.json(response)
    }

    static async apiGetAuthorById(req, res, next) {
        try {
            let id = req.params.author_id || {}
            let author = await AuthorsDAO.getAuthorByID(id)
            if (!author) {
                res.status(404).json({ error: "Not found" })
                return
            }
            //let updated_type = author.lastupdated instanceof Date ? "Date" : "other"
            res.json({ author })
        } catch (e) {
            console.log(`api, ${e}`)
            res.status(500).json({ error: e })
        }
    }

    static async apiGetNestedDocsByID(req, res, next) {
        try {
            let ids = req.query.ids == "" ? "" : req.body.author_ids
            let idsList = Array.isArray(ids) ? ids : Array(ids)
            let authorsList = await AuthorsDAO.getNestedDocsByID(idsList)
            let response = { "result": authorsList }

            res.json(response)
        } catch (e) {
            console.log(`api, ${e}`)
            res.status(500).json({ error: e })
        }
    }

    static async apiCreateAuthor(req, res) {

        try {
            const authorFromBody = req.body
            let errors = {}
            if (authorFromBody && authorFromBody.first_name.length < 4) {
                errors.password = "Your title must be at least 4 characters."
            }

            if (Object.keys(errors).length > 0) {
                res.status(400).json(errors)
                return
            }
            const insertResult = await AuthorsDAO.addAuthor(authorFromBody)

            if (!insertResult.success) {
                errors.email = insertResult.error
            }

            const authorFromDB = await AuthorsDAO.getAuthor(authorFromBody.first_name, authorFromBody.last_name)
            if (!authorFromDB) {
                errors.general = "Internal error, please try again later"
            }
            if (Object.keys(errors).length > 0) {
                res.status(400).json(errors)
                return
            }

            const author = new Author(authorFromDB)

            res.json({ author, "result": "added successfully" })
        } catch (e) {
            res.status(500).json({ error: e })
        }
    }
    static async save(req, res) {
        try {

            await AuthorsDAO.updateAuthor(
                req.body.id,
                req.body.first_name,
                req.body.last_name,
            )
            const authorFromDB = await AuthorsDAO.getAuthor(req.body.first_name, req.body.last_name)
            const updatedAuthor = new Author(authorFromDB)

            res.json({ "result": "updated successfully" })
        } catch (e) {
            res.status(500).json(e)
        }
    }
}