import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { useState } from 'react';

import { fetchDecks } from './anki';

function Home() {
    const { data: decks } = useQuery({
        queryFn: fetchDecks,
        queryKey: ["decks"]
    });

    const [state, setState] = useState("")

    return (
        <>
            <div>
                <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">Deck</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={state}
                        label="Deck"
                        onChange={e => { e.target.value && setState(e.target.value) }}
                    >
                        {decks && decks.map(deck => <MenuItem value={deck}>{deck}</MenuItem>)}
                    </Select>
                </FormControl>
            </div>
        </>
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
