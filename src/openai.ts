export async function suggestAnkiNotes(
    { deckName, modelName, prompt }
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
                content: 'You are a helpful assistant.'
            },
            {
                role: 'user',
                content: prompt,
            },
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
        fields
    }))
}
