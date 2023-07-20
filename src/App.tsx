import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import './App.css'

import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { useState } from 'react';

const ankiConnect = async (params: any) => {
    const res = await fetch('http://localhost:8765', {
        method: "POST",
        body: JSON.stringify({
            version: 6,
            ...params
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    if (!res.ok) {
        throw new Error('Network response was not ok')
    }
    const data: any = await res.json();
    if (data.error) {
        throw new Error(data.error)
    }
    return data.result;
}

const fetchDecks = async (): Promise<string[]> => {
    return ankiConnect({ action: "deckNames" });
}


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
