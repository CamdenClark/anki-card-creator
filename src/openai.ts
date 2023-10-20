interface Note {
    modelName: string;
    deckName: string;
    fields: { Front: string, Back: string };
    tags: string[];
    key: string;
}

const systemPrompt = (notes: Note[], trashedNotes: Note[], createdNotes: Note[]) => {
    let outstandingCards = notes.map(note => `Front: ${note.fields.Front}\nBack: ${note.fields.Back}`).join('\n');
    let trashedCards = trashedNotes.map(note => `Front: ${note.fields.Front}\nBack: ${note.fields.Back}`).join('\n');
    let createdCards = createdNotes.map(note => `Front: ${note.fields.Front}\nBack: ${note.fields.Back}`).join('\n');

    return `You are an assistant assigned to create Anki cards.
Make cards concise but contextual. 

${trashedCards.length > 0 && "The user already rejected these cards:" + trashedCards}

${createdCards.length > 0 && "The user created these cards: " + createdCards}

${outstandingCards.length > 0 && "The user hasn't taken an action on these suggested cards: " + outstandingCards}

Create cards based on user's prompt.

Example:
Front: Which Roman emperor divided the Roman empire?
Back: Diocletian`;
};


export async function suggestAnkiNotes(
    openAIKey: string,
    { deckName, modelName, prompt, tags },
    notes: Note[],
    createdNotes: Note[],
    trashedNotes: Note[],
): Promise<any> {
    const body = {
        model: 'gpt-4',
        messages: [
            {
                role: 'system',
                content: systemPrompt(notes, createdNotes, trashedNotes)
            },
            {
                role: 'user',
                content: prompt,
            }
        ],
    };
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openAIKey}`,
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error('OpenAI API request failed');
    const data = await res.json();

    if (!data.choices || !data.choices.length) {
        throw new Error('No completion choices were returned from OpenAI');
    }

    const noteContent = data.choices[0].message.content;
    let result = [];
    let currentObj = {};

    for (const line of noteContent.split('\n')) {
        if (!line.trim()) continue;

        const [key, value] = line.split(': ');

        if (key === 'Front' || key === 'Back') {
            currentObj[key] = value;
            if ('Front' in currentObj && 'Back' in currentObj) {
                result.push(currentObj);
                currentObj = {};
            }
        }
    }


    return result.map(fields =>
    ({
        key: crypto.randomUUID(),
        deckName,
        modelName,
        fields,
        tags
    }))
}
