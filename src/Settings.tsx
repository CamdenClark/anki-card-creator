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
            <Typography variant="h4">Settings</Typography>
            <Typography>To generate the OpenAI API key, please follow the instructions on <Link href="https://platform.openai.com/account/api-keys" target="_blank" rel="noopener noreferrer">this page</Link>.</Typography>
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
