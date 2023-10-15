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

export const fetchTags = async (): Promise<string[]> => {
    return ankiConnect({ action: "getTags" });
}

export const fetchDecks = async (): Promise<string[]> => {
    return ankiConnect({ action: "deckNames" });
}

export const fetchModels = async (): Promise<string[]> => {
    return ankiConnect({ action: "modelNames" });
}

export const addNote = async (note: any): Promise<string[]> => {
    return ankiConnect({
        action: "addNote",
        params: { note }
    });
}
export const fetchModelFieldNames = async (modelName: string): Promise<string[]> => {
    return ankiConnect({
        action: "modelFieldNames",
        params: { modelName }
    });
}

export const fetchRecentNotes = async (modelName: string, tags: string[]): Promise<any[]> => {
    const searchString = `added:90 ${tags.map(tag => `"tag:${tag}"`).join(' ')} "note:${modelName}"`;
    let noteIds = await ankiConnect({
        action: "findNotes",
        params: { query: searchString }
    });

    if (noteIds.length === 0) {
     noteIds = await ankiConnect({
        action: "findNotes",
        params: { query: `added:30 "note:${modelName}"` }
    });
    }

    const notes = await ankiConnect({
        action: "notesInfo",
        params: { notes: noteIds }
    });
    return notes;
}
