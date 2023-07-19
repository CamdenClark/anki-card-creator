import './App.css'

import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'

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

    return (
        <>
            <div>
                {decks && decks.map(deck => <div>{deck}</div>)}
            </div>
            <h1>Vite + React</h1>
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
