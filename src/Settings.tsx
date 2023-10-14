import React from 'react';
import { TextField } from '@mui/material';
import useLocalStorage from './useLocalStorage';

function Settings() {
    const [openAIKey, setOpenAIKey] = useLocalStorage('openAIKey', '');

    const handleOpenAIKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setOpenAIKey(event.target.value);
    };

    return (
        <div>
            <h1>Settings</h1>
            <TextField
                type="password"
                label="OpenAI Key"
                value={openAIKey}
                onChange={handleOpenAIKeyChange}
            />
        </div>
    );
}

export default Settings;
