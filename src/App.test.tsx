import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node'
import { rest } from 'msw'
import { afterAll, beforeAll, expect, it } from "vitest"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';

const server = setupServer(
    rest.post('http://localhost:8765', async (req, res, ctx) => { // setup a mock server
        const { action, params } = await req.json()
        if (action === 'deckNames') {
            return res(ctx.json({ result: ['deck1', 'deck2', 'deck3'] })) // return mock response for deckNames
        }
        if (action === 'modelNames') {
            return res(ctx.json({ result: ['model1', 'model2', 'model3'] })) // return mock response for modelNames
        }
        if (action === 'modelFieldNames' && params?.modelName === 'Basic') {
            return res(ctx.json({ result: ['field1', 'field2', 'field3'] })) // return mock response for modelFieldNames
        }
        return res(ctx.status(404))
    })
)

beforeAll(() => server.listen()) // start the server before all tests
afterAll(() => server.close()) // close the server after all tests


it('renders select dropdown with deck names', async () => {
  const queryClient = new QueryClient();
  render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
  expect(screen.getByText(/Deck/i));
  const select = screen.getByLabelText(/Deck/i)
  fireEvent.mouseDown(select) // Open the dropdown menu  
  await waitFor(() => {
    expect(screen.getByText(/deck1/i))
    expect(screen.getByText(/deck2/i))
    expect(screen.getByText(/deck3/i))
  })
});

it('selects a deck', async () => {
  const queryClient = new QueryClient();
  render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
  expect(screen.getByText(/Deck/i));
  const select = screen.getByLabelText(/Deck/i)
  fireEvent.mouseDown(select) // Open the dropdown menu  
  const menuItem = await screen.findByText(/deck2/i) 
  // Find the specific MenuItem by text
  fireEvent.click(menuItem) // Select the MenuItem  
  await waitFor(() => {
    expect(screen.getByLabelText(/Deck/i).textContent).toBe('deck2')
  })
});
