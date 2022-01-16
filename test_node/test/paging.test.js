import BooksDAO from "../src/dao/booksDAO"

describe("Paging", () => {
  beforeAll(async () => {
    await BooksDAO.injectDB(global.client)
  })

  test("Supports paging by cast", async () => {
    const filters = { cast: ["Tom Hanks", "Natalie Portman"] }
    /**
     * Testing first page
     */
    const { booksList: firstPage, totalNumBooks } = await BooksDAO.getBooks(
      {
        filters,
      },
    )

    // check the total number of books, including both pages
    expect(totalNumBooks).toEqual(60)

    // check the number of books on the first page
    expect(firstPage.length).toEqual(20)

    // check some of the books on the second page
    const firstBook = firstPage[0]
    const twentiethBook = firstPage.slice(-1).pop()
    expect(firstBook.title).toEqual(
      "Star Wars: Episode III - Revenge of the Sith",
    )
    expect(twentiethBook.title).toEqual("Sleepless in Seattle")

    /**
     * Testing second page
     */
    const { booksList: secondPage } = await BooksDAO.getBooks({
      filters,
      page: 1,
    })

    // check the number of books on the second page
    expect(secondPage.length).toEqual(20)
    // check some of the books on the second page
    const twentyFirstBook = secondPage[0]
    const twentyNinthBook = secondPage.slice(-1).pop()
    expect(twentyFirstBook.title).toEqual("Lèon: The Professional")
    expect(twentyNinthBook.title).toEqual("Your Highness")

    /**
     * Testing third page
     */
    const { booksList: thirdPage } = await BooksDAO.getBooks({
      filters,
      page: 2,
    })

    // check the number of books on the second page
    expect(thirdPage.length).toEqual(20)
    // check some of the books on the second page
    const thirtyFirstBook = thirdPage[0]
    const lastBook = thirdPage.slice(-1).pop()
    expect(thirtyFirstBook.title).toEqual("Goya's Ghosts")
    expect(lastBook.title).toEqual("The Da Vinci Code")
  })

  test("Supports paging by genre", async () => {
    const filters = { genre: ["Comedy", "Drama"] }

    /**
     * Testing first page
     */
    const { booksList: firstPage, totalNumBooks } = await BooksDAO.getBooks(
      {
        filters,
      },
    )

    // check the total number of books, including both pages
    expect(totalNumBooks).toEqual(17903)

    // check the number of books on the first page
    expect(firstPage.length).toEqual(20)

    // check some of the books on the second page
    const firstBook = firstPage[0]
    const twentiethBook = firstPage.slice(-1).pop()
    expect(firstBook.title).toEqual("Titanic")
    expect(twentiethBook.title).toEqual("Dègkeselyè")

    /**
     * Testing second page
     */
    const { booksList: secondPage } = await BooksDAO.getBooks({
      filters,
      page: 1,
    })

    // check the number of books on the second page
    expect(secondPage.length).toEqual(20)
    // check some of the books on the second page
    const twentyFirstBook = secondPage[0]
    const fortiethBook = secondPage.slice(-1).pop()
    expect(twentyFirstBook.title).toEqual("8 Mile")
    expect(fortiethBook.title).toEqual("Forrest Gump")
  })

  test("Supports paging by text", async () => {
    const filters = { text: "countdown" }

    /**
     * Testing first page
     */
    const { booksList: firstPage, totalNumBooks } = await BooksDAO.getBooks(
      {
        filters,
      },
    )

    // check the total number of books, including both pages
    expect(totalNumBooks).toEqual(12)

    // check the number of books on the first page
    expect(firstPage.length).toEqual(12)

    // check some of the books on the second page
    const firstBook = firstPage[0]
    const twentiethBook = firstPage.slice(-1).pop()
    expect(firstBook.title).toEqual("Countdown")
    expect(twentiethBook.title).toEqual("The Front Line")

    /**
     * Testing second page
     */
    const { booksList: secondPage } = await BooksDAO.getBooks({
      filters,
      page: 1,
    })

    // check the number of books on the second page
    expect(secondPage.length).toEqual(0)
  })
})
