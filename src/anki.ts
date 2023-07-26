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
