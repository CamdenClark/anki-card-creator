import { Autocomplete, Button, Card, CardActions, CardContent, CircularProgress, FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';

import { QueryClient, QueryClientProvider, useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react';

import { addNote, fetchDecks, fetchModels, fetchTags, fetchRecentNotes } from './anki';
import { suggestAnkiNotes } from './openai';

interface Fields {
    Front: string;
    Back: string;
}
interface Note {
    modelName: string;
    deckName: string;
    fields: Fields;
    tags: string[];
}
interface CardProps {
    note: Note;
}
function useLocalStorage<T>(
    storageKey: string,
    fallbackState: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [value, setValue] = useState<T>(() => {
        const storedValue = localStorage.getItem(storageKey);
        if (storedValue !== null) {
            return JSON.parse(storedValue);
        }
        return fallbackState;
    });

    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(value));
    }, [value, storageKey]);

    return [value, setValue];
}

const NoteComponent: React.FC<CardProps> = ({ note }) => {
    const [currentNote, setCurrentNote] = useState(note);
    const { modelName, deckName, fields, tags } = currentNote;

    const handleFieldChange = (event: React.ChangeEvent<{ name: string, value: unknown }>) => {
        setCurrentNote(prev => ({
            ...prev,
            fields: { ...prev.fields, [event.target.name]: event.target.value }
        }));
    };

    const handleTagsChange = (_: any, tags: string[]) => {
        setCurrentNote(prev => ({
            ...prev,
            tags
        }));
    };

    const [hidden, setHidden] = useState(false);


    const { isLoading, mutate } = useMutation({
        mutationFn: addNote,
        onSuccess: (_) => setHidden(true),
    })

    const { data: allTags } = useQuery({
        queryFn: fetchTags,
        queryKey: ["tags"]
    });

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
                        <Grid item xs={6}>
                            <Autocomplete
                                id="tags"
                                multiple
                                autoHighlight
                                freeSolo
                                value={tags}
                                options={allTags || []}
                                onChange={handleTagsChange}
                                renderInput={(params) => <TextField label="Tags" {...params} />}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Front"
                                defaultValue={fields.Front}
                                multiline
                                onChange={handleFieldChange}
                                name="front"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Back"
                                defaultValue={fields.Back}
                                multiline
                                onChange={handleFieldChange}
                                name="back"
                            />
                        </Grid>
                    </Grid>
                </CardContent>
                <CardActions>
                    <Button size="small" color="secondary" onClick={() => setHidden(true)}>
                        Trash
                    </Button>
                    <Button size="small" color="primary" onClick={() => mutate(currentNote)}
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

    const { data: tags } = useQuery({
        queryFn: fetchTags,
        queryKey: ["tags"]
    });


    const [notes, setNotes] = useState<Note[]>([])

    const [deckName, setDeckName] = useLocalStorage("deckName", "Default")
    const [modelName, setModelName] = useLocalStorage("modelName", "Basic")
    const [currentTags, setCurrentTags] = useLocalStorage<string[]>("tags", [])

    const { data: recentNotes } = useQuery({
        queryFn: () => fetchRecentNotes(currentTags),
        queryKey: ["recentNotes", currentTags],
    });


    const { isLoading, mutate } = useMutation({
        mutationFn: suggestAnkiNotes,
        onSuccess: (newNotes) => {
            setNotes(notes => [...notes, ...newNotes])
        }
    })

    const [prompt, setPrompt] = useState("")

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
                            disabled
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
                        <Autocomplete
                            id="tags"
                            multiple
                            autoHighlight
                            value={currentTags}
                            options={tags || []}
                            onChange={(_, value) => { value && setCurrentTags(value) }}
                            filterOptions={(options, params) => {
                                const filtered = options.filter((option) =>
                                    option.toLowerCase().includes(params.inputValue.toLowerCase())
                                );

                                if (params.inputValue !== '') {
                                    filtered.push(`Add "${params.inputValue}"`);
                                }

                                return filtered;
                            }}
                            renderInput={(params) => <TextField label="Tags" {...params} />}
                        />
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
                        disabled={isLoading}
                        onClick={(_) => mutate({ deckName, modelName, tags: currentTags, prompt, recentNotes  })}>
                        Suggest cards
                    </Button>
                </Grid>
            </Grid>
            <Grid container item>
                {isLoading && <CircularProgress />}
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
