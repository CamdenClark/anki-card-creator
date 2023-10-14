const systemPrompt = (recentNotes) => {
    let notesString = '';
    recentNotes.slice(-5).forEach((note) => {
        for (const [field, value] of Object.entries(note.fields)) {
            notesString += `${field}: ${value.value}\n`;
        }
    });
    return `You are an assistant assigned to create Anki cards.
You should make sure all cards are concise but have
enough context to understand seen out of context when reviewed
in the future. You don't need to be chatty, or have proper
grammar necessarily.

${notesString.length > 0 && "Here are some examples of cards we have:\n" + notesString}

Create cards based on the user's passed in prompt.`
};

export async function suggestAnkiNotes(
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
                        Front: { type: "string" },
                        Back: { type: "string" }
                    },
                    required: ["Front", "Back"]
                }
            },
        }
    }
    const body = {
        model: 'gpt-3.5-turbo',
        messages: [
            {
                role: 'system',
                content: systemPrompt(recentNotes)
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
            Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
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
