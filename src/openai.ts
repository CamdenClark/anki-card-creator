interface Note {
    modelName: string;
    deckName: string;
    fields: { Front: string, Back: string };
    tags: string[];
    key: string;
    trashed?: boolean;
    created?: boolean;
}

const systemPrompt = (notes: Note[]) => {
    let outstandingCards = notes
        .filter(n => !n.trashed && !n.created)
        .map(note => `Front: ${note.fields.Front}\nBack: ${note.fields.Back}`)
        .join('\n');
    let trashedCards = notes
        .filter(n => n.trashed)
        .map(note => `Front: ${note.fields.Front}\nBack: ${note.fields.Back}`)
        .join('\n');
    let createdCards = notes
        .filter(n => n.created)
        .map(note => `Front: ${note.fields.Front}\nBack: ${note.fields.Back}`)
        .join('\n');

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



interface Options {
    deckName: string;
    modelName: string;
    prompt: string;
    tags: string[];
}

export async function suggestAnkiNotes(
    openAIKey: string,
    { deckName, modelName, prompt, tags }: Options,
    notes: Note[],
): Promise<any> {
    const body = {
        model: 'gpt-4',
        messages: [
            {
                role: 'system',
                content: systemPrompt(notes)
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

    const regex = /Front:([\s\S]*?)Back:([\s\S]*?)(?=Front|$)/g;

    let match;
    while ((match = regex.exec(noteContent)) !== null) {
        result.push({
            Front: match[1].trim(),
            Back: match[2].trim()
        });
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
