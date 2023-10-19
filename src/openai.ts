const systemPrompt = (tags) => {
    return `You are an assistant assigned to create Anki cards.
You should make sure all cards are concise but have
enough context to understand seen out of context when reviewed
in the future. You don't need to be chatty, or have proper
grammar necessarily.

Stick to the minimum information principle: The material you learn
must be formulated in as simple way as it is only possible. 

Tags associated with these cards are: ${tags.join(', ')}

Create cards based on the user's passed in prompt.

Cards should be in this format:

Front: Which Roman emperor divided the Roman empire into the East and West?
Back: Diocletian`

};

export async function suggestAnkiNotes(
    openAIKey: string,
    { deckName, modelName, prompt, tags },
    createdNotes: Note[],
    trashedNotes: Note[],
): Promise<any> {
    const body = {
        model: 'gpt-4',
        messages: [
            {
                role: 'system',
                content: systemPrompt(tags)
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
