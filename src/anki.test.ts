import { setupServer } from 'msw/node'
import { rest } from 'msw'
import { fetchDecks } from './anki' // import the function from the correct path
import { afterAll, beforeAll, expect, it } from "vitest"

const server = setupServer(
    rest.post('http://localhost:8765', (_, res, ctx) => { // setup a mock server
        return res(ctx.json({ result: ['deck1', 'deck2', 'deck3'] })) // return a mock response
    })
)

beforeAll(() => server.listen()) // start the server before all tests
afterAll(() => server.close()) // close the server after all tests
it('fetches decks correctly', async () => {
    const decks = await fetchDecks()
    expect(decks).toEqual(['deck1', 'deck2', 'deck3'])
})
it('properly handles network errors', async () => {
    server.use(
        rest.post('http://localhost:8765', (_, res, ctx) => {
            return res(ctx.status(500))
        })
    )
    await expect(fetchDecks()).rejects.toThrow('Network response was not ok')
})
it('throws an error when the server returns an error message', async () => {
    server.use(
        rest.post('http://localhost:8765', (_, res, ctx) => {
            return res(ctx.json({ error: 'Server error' }))
        })
    )
    await expect(fetchDecks()).rejects.toThrow('Server error')
})
