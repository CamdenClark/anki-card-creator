import { setupServer } from 'msw/node'
import { rest } from 'msw'
import { fetchDecks, fetchModels } from './anki' // import the functions from the correct path
import { afterAll, beforeAll, expect, it } from "vitest"
const server = setupServer(
    rest.post('http://localhost:8765', async (req, res, ctx) => { // setup a mock server
        const { action } = await req.json()
        if (action === 'deckNames') {
            return res(ctx.json({ result: ['deck1', 'deck2', 'deck3'] })) // return mock response for deckNames
        }
        if (action === 'modelNames') {
            return res(ctx.json({ result: ['model1', 'model2', 'model3'] })) // return mock response for modelNames
        }
        return res(ctx.status(404))
    })
)
beforeAll(() => server.listen()) // start the server before all tests
afterAll(() => server.close()) // close the server after all tests

it('fetches deck names correctly', async () => {
    const deckNames = await fetchDecks()
    expect(deckNames).toEqual(['deck1', 'deck2', 'deck3'])
})

it('fetches model names correctly', async () => {
    const modelNames = await fetchModels()
    expect(modelNames).toEqual(['model1', 'model2', 'model3'])
})
it('properly handles network errors when fetching deck names', async () => {
    server.use(
        rest.post('http://localhost:8765', (_, res, ctx) => {
            return res(ctx.status(500))
        })
    )
    await expect(fetchDecks()).rejects.toThrow('Network response was not ok')
})
it('properly handles network errors when fetching model names', async () => {
    server.use(
        rest.post('http://localhost:8765', (_, res, ctx) => {
            return res(ctx.status(500))
        })
    )
    await expect(fetchModels()).rejects.toThrow('Network response was not ok')
})
it('throws an error when the server returns an error message for deck names', async () => {
    server.use(
        rest.post('http://localhost:8765', (_, res, ctx) => {
            return res(ctx.json({ error: 'Server error' }))
        })
    )
    await expect(fetchDecks()).rejects.toThrow('Server error')
})
it('throws an error when the server returns an error message for model names', async () => {
    server.use(
        rest.post('http://localhost:8765', (_, res, ctx) => {
            return res(ctx.json({ error: 'Server error' }))
        })
    )
    await expect(fetchModels()).rejects.toThrow('Server error')
})
