import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { useState } from 'react';

import { fetchDecks, fetchModels } from './anki';

function Home() {
    const { data: decks } = useQuery({
        queryFn: fetchDecks,
        queryKey: ["decks"]
    });

    const { data: models } = useQuery({
        queryFn: fetchModels,
        queryKey: ["models"]
    });

    const [deck, setDeck] = useState("")
    const [model, setModel] = useState("")

    return (
        <div>
            <FormControl fullWidth>
                <InputLabel id="deck-label">Deck</InputLabel>
                <Select
                    labelId="deck-label"
                    id="deck"
                    value={deck}
                    onChange={e => { e.target.value && setDeck(e.target.value) }}
                >
                    {decks && decks.map(deck => <MenuItem key={"deck" + deck} value={deck}>{deck}</MenuItem>)}
                </Select>
            </FormControl>
            <FormControl fullWidth>
                <InputLabel id="note-type-label">Note type</InputLabel>
                <Select
                    labelId="note-type-label"
                    id="note-type"
                    value={model}
                    onChange={e => { e.target.value && setModel(e.target.value) }}
                >
                    {models && models.map(model => <MenuItem key={"model" + model} value={model}>{model}</MenuItem>)}
                </Select>
            </FormControl>
        </div>
    );
}

function App() {
    return (
        <QueryClientProvider client={new QueryClient()}>
            <Home />
        </QueryClientProvider>
    )
}

export default App
