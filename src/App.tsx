import { Alert, Autocomplete, Button, Card, CardActions, CardContent, CircularProgress, FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';

import { useMutation, useQuery } from '@tanstack/react-query'
import { useContext, useState } from 'react';

import { addNote, fetchDecks, fetchTags } from './anki';
import { suggestAnkiNotes } from './openai';
import { OpenAIKeyContext } from './OpenAIKeyContext';
import useLocalStorage from './useLocalStorage';

interface Note {
    modelName: string;
    deckName: string;
    fields: { Front: string, Back: string };
    tags: string[];
    key: string;
    trashed?: boolean;
    created?: boolean;
}

interface CardProps {
    note: Note;
    onTrash: () => void;
    onCreate: () => void;
}

const NoteComponent: React.FC<CardProps> = ({ note, onTrash, onCreate }) => {
    const [currentNote, setCurrentNote] = useState(note);
    const { modelName, deckName, fields, tags, trashed, created } = currentNote;

    const handleFieldChange = (event: React.ChangeEvent<{ name: string, value: string }>) => {
        if (event.target.name) {
            setCurrentNote(prev => ({
                ...prev,
                fields: { ...prev.fields, [event.target.name]: event.target.value }
            }));
        }
    };

    const handleTagsChange = (_: any, tags: string[]) => {
        setCurrentNote(prev => ({
            ...prev,
            tags
        }));
    };

    const { isLoading, mutate } = useMutation({
        mutationFn: addNote,
        onSuccess: (_) => onCreate()
    })

    const { data: allTags } = useQuery({
        queryFn: fetchTags,
        queryKey: ["tags"]
    });

    return !trashed && !created && (
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
                                name="Front"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Back"
                                defaultValue={fields.Back}
                                multiline
                                onChange={handleFieldChange}
                                name="Back"
                            />
                        </Grid>
                    </Grid>
                </CardContent>
                <CardActions>
                    <Button size="small" color="secondary" onClick={() => onTrash()}>
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

interface Options {
    deckName: string;
    modelName: string;
    prompt: string;
    tags: string[];
}

function Home() {
    const { data: decks, error: ankiError } = useQuery({
        queryFn: fetchDecks,
        queryKey: ["decks"],
        retry: false
    });


    const { data: tags } = useQuery({
        queryFn: fetchTags,
        queryKey: ["tags"],
    });

    const [notes, setNotes] = useState<Note[]>([])

    const [deckName, setDeckName] = useLocalStorage("deckName", "Default")
    const modelName = "Basic";

    const [currentTags, setCurrentTags] = useLocalStorage<string[]>("tags", [])

    const { openAIKey } = useContext(OpenAIKeyContext);

    const { isLoading, mutate } = useMutation({
        mutationFn: (data: Options) => suggestAnkiNotes(openAIKey, data, notes),
        onSuccess: (newNotes) => {
            setNotes(notes => [...notes, ...newNotes])
        }
    })

    const [prompt, setPrompt] = useState("")

    return (
        <Grid container sx={{ padding: "25px", maxWidth: 1200 }} spacing={4} justifyContent="flex-start"
            direction="column"
        >
            {ankiError ?
                <Alert severity="error" sx={{ marginTop: "20px" }}>Error: We can't connect to Anki using AnkiConnect. Please make sure Anki is running and you have the AnkiConnect plugin enabled, and that you have set the CORS settings.</Alert>
                : <></>}
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
                        <Autocomplete
                            id="tags"
                            multiple
                            autoHighlight
                            value={currentTags}
                            options={tags || []}
                            onChange={(_, value) => { value && setCurrentTags(value) }}
                            freeSolo
                            renderInput={(params) => <TextField label="Tags" {...params} />}
                        />
                    </FormControl>
                </Grid>
                <Grid item>
                    <FormControl fullWidth>
                        <TextField
                            id="prompt"
                            label="Prompt"
                            maxRows={10}
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
                        onClick={(_) => mutate({ deckName, modelName, tags: currentTags, prompt })}>
                        Suggest cards
                    </Button>
                </Grid>
            </Grid>
            <Grid container item>
                {isLoading && <CircularProgress />}
            </Grid>
            <Grid container item spacing={2} alignItems="stretch">
                {notes
                    .filter(n => !n.trashed)
                    .filter(n => !n.created)
                    .map((note) =>
                        <NoteComponent
                            key={note.key}
                            note={note}
                            onTrash={() => {
                                setNotes(notes => notes.map((n) => note.key === n.key ? { ...n, trashed: true } : n))
                            }}
                            onCreate={() => {
                                setNotes(notes => notes.map((n) => note.key === n.key ? { ...n, created: true } : n))
                            }}
                        />
                    )}
            </Grid>
        </Grid>
    );
}

export default Home
