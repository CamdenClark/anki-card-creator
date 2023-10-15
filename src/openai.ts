const systemPrompt = (recentNotes, tags) => {
    const notesString = recentNotes.slice(-5).map((note) => {
        return Object.entries(note.fields).map(([field, value]) => `${field}: ${value.value}`).join('\n');
    }).join('\n');
    return `You are an assistant assigned to create Anki cards.
You should make sure all cards are concise but have
enough context to understand seen out of context when reviewed
in the future. You don't need to be chatty, or have proper
grammar necessarily.

Stick to the minimum information principle: The material you learn
must be formulated in as simple way as it is only possible. 
Simplicity does not have to imply losing information.

Tags associated with these cards are: ${tags.join(', ')}

${notesString.length > 0 && 
    "Here are some examples of notes recently created by the user:\n" + notesString}

Create cards based on the user's passed in prompt.`
};

export async function suggestAnkiNotes(
    openAIKey: string,
    { deckName, modelName, prompt, tags, recentNotes }
): Promise<any> {
    const function_parameters: object = {
        type: "object",
        properties: {
            notes: {
                type: "array",
                minItems: 3,
                items: {
                    type: "object",
                    properties: {
                        ...modelFieldNames.reduce((acc, fieldName) => {
                            acc[fieldName] = { type: "string" };
                            return acc;
                        }, {}),
                    },
                    required: modelFieldNames
                }
            },
        }
    }
    const body = {
        model: 'gpt-4',
        messages: [
            {
                role: 'system',
                content: systemPrompt(recentNotes, tags)
            },
            {
                role: 'user',
                content: prompt,
            }
        ],
        functions: [
            {
                name: 'createAnkiCard',
                parameters: function_parameters,
            },
        ],
        function_call: {
            name: 'createAnkiCard',
        }
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

    const notes = JSON.parse(data.choices[0].message.function_call.arguments).notes
    return notes.map(fields =>
    ({
        deckName,
        modelName,
        fields,
        tags
    }))
}
