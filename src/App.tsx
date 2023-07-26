import { Button, Card, CardActions, CardContent, FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';

import { QueryClient, QueryClientProvider, useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react';

import { addNote, fetchDecks, fetchModels } from './anki';
import { suggestAnkiNotes } from './openai';

interface Fields {
    Front: string;
    Back: string;
}
interface Note {
    modelName: string;
    deckName: string;
    fields: Fields;
}
interface CardProps {
    note: Note;
}
const NoteComponent: React.FC<CardProps> = ({ note }) => {
    const { fields, deckName, modelName } = note;
    const [formState, setFormState] = useState(fields);
    const [hidden, setHidden] = useState(false);
    const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        setFormState({ ...formState, [event.target.name]: event.target.value });
    };

    const { isLoading, mutate } = useMutation({
        mutationFn: addNote,
        onSuccess: (_) => setHidden(true),
    })

    return !hidden && (
        <Grid item xs={12} md={6}>
            <Card>
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TextField
                                label="Deck"
                                value={deckName}
                                disabled
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Note type"
                                value={modelName}
                                disabled
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Front"
                                defaultValue={fields.Front}
                                multiline
                                onChange={handleChange}
                                name="front"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Back"
                                defaultValue={fields.Back}
                                multiline
                                onChange={handleChange}
                                name="back"
                            />
                        </Grid>
                    </Grid>
                </CardContent>
                <CardActions>
                    <Button size="small" color="secondary" onClick={() => setHidden(true)}>
                        Trash
                    </Button>
                    <Button size="small" color="primary" onClick={() => mutate({ modelName, deckName, fields: formState })}
                        disabled={isLoading} >
                        Add note
                    </Button>
                </CardActions>
            </Card>
        </Grid>
    );
};
function Home() {
    const { data: decks } = useQuery({
        queryFn: fetchDecks,
        queryKey: ["decks"]
    });

    const { data: models } = useQuery({
        queryFn: fetchModels,
        queryKey: ["models"]
    });

    const { isLoading, mutate } = useMutation({
        mutationFn: suggestAnkiNotes,
        onSuccess: (newNotes) => {
            setNotes(notes => [...notes, ...newNotes])
        }
    })

    const [deckName, setDeckName] = useState("")
    const [modelName, setModelName] = useState("")
    const [prompt, setPrompt] = useState("")

    const [notes, setNotes] = useState([])

    return (
        <Grid container sx={{ padding: "25px", maxWidth: 1200 }} spacing={4} justifyContent="flex-start"
            direction="column"
        >
            <Grid container item direction="column" spacing={2} justifyContent="flex-start">
                <Grid item>
                    <FormControl fullWidth>
                        <InputLabel id="deck-label">Deck</InputLabel>
                        <Select
                            labelId="deck-label"
                            label="Deck"
                            id="deck"
                            value={deckName}
                            onChange={e => { e.target.value && setDeckName(e.target.value) }}
                        >
                            {decks && decks.map(deckName =>
                                <MenuItem key={"deck" + deckName} value={deckName}>{deckName}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item>
                    <FormControl fullWidth>
                        <InputLabel id="note-type-label">Note type</InputLabel>
                        <Select
                            labelId="note-type-label"
                            label="Note type"
                            id="note-type"
                            value={modelName}
                            onChange={e => { e.target.value && setModelName(e.target.value) }}
                        >
                            {models && models.map(modelName =>
                                <MenuItem key={"model" + modelName} value={modelName}>{modelName}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item>
                    <FormControl fullWidth>
                        <TextField
                            id="prompt"
                            label="Prompt"
                            multiline
                            value={prompt}
                            onChange={e => setPrompt(e.target.value)}
                        />
                    </FormControl>
                </Grid>
                <Grid item>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={(_) => mutate({ deckName, modelName, prompt })}>
                        Suggest cards
                    </Button>
                </Grid>
            </Grid>
            <Grid container item spacing={2} alignItems="stretch">
                {notes.map(note =>
                    <NoteComponent note={note} />
                )}
            </Grid>
        </Grid>

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
