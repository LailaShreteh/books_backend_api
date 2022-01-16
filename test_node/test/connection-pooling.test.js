import BooksDAO from "../src/dao/booksDAO"

describe("Connection Pooling", () => {
  beforeAll(async () => {
    await BooksDAO.injectDB(global.client)
  })

  test("Connection pool size is 50", async () => {
    const response = await BooksDAO.getConfiguration()
    expect(response.poolSize).toBe(50)
  })
})
