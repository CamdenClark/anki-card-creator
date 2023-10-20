import { Autocomplete, Button, Card, CardActions, CardContent, CircularProgress, FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';

import { useMutation, useQuery } from '@tanstack/react-query'
import { useContext, useState } from 'react';

import { addNote, fetchDecks, fetchTags, fetchModelFieldNames } from './anki';
import { suggestAnkiNotes } from './openai';
import { OpenAIKeyContext } from './OpenAIKeyContext';

interface Note {
    modelName: string;
    deckName: string;
    fields: object;
    tags: string[];
    key: string;
}

interface CardProps {
    note: Note;
}

import useLocalStorage from './useLocalStorage';

const NoteComponent: React.FC<CardProps> = ({ note, onTrash, onCreate }) => {
    const [currentNote, setCurrentNote] = useState(note);
    const { modelName, deckName, fields, tags } = currentNote;

    const handleFieldChange = (event: React.ChangeEvent<{ name?: string, value: unknown }>) => {
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

    return (
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
                        {Object.keys(fields).map((fieldKey) => (
                            <Grid item xs={12} key={fieldKey}>
                                <TextField
                                    fullWidth
                                    label={fieldKey}
                                    defaultValue={fields[fieldKey]}
                                    multiline
                                    onChange={handleFieldChange}
                                    name={fieldKey}
                                />
                            </Grid>
                        ))}
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

function Home() {
    const { data: decks } = useQuery({
        queryFn: fetchDecks,
        queryKey: ["decks"]
    });

    const { data: tags } = useQuery({
        queryFn: fetchTags,
        queryKey: ["tags"]
    });

    const [notes, setNotes] = useState<Note[]>([])
    const [trashedNotes, setTrashedNotes] = useState<Note[]>([]);
    const [createdNotes, setCreatedNotes] = useState<Note[]>([]);

    const [deckName, setDeckName] = useLocalStorage("deckName", "Default")
    const modelName = "Basic";

    const [currentTags, setCurrentTags] = useLocalStorage<string[]>("tags", [])

    const { openAIKey } = useContext(OpenAIKeyContext);

    const { isLoading, mutate } = useMutation({
        mutationFn: (data) => suggestAnkiNotes(openAIKey, data, notes, createdNotes, trashedNotes),
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
                {notes.map((note) =>
                    <NoteComponent
                        key={note.key}
                        note={note}
                        onTrash={() => {
                            setNotes(notes => notes.filter(n => n !== note))
                            setTrashedNotes(notes => [...notes, note])
                        }}
                        onCreate={() => {
                            setNotes(notes => notes.filter(n => n !== note))
                            setCreatedNotes(notes => [...notes, note])
                        }
                        } />
                )}
            </Grid>
        </Grid>
    );
}

export default Home
