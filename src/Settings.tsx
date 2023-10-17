import React from 'react';
import { TextField, Typography, Link, Grid, Container } from '@mui/material';
import useLocalStorage from './useLocalStorage';

function Settings() {
    const [openAIKey, setOpenAIKey] = useLocalStorage('openAIKey', '');

    const handleOpenAIKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setOpenAIKey(event.target.value);
    };

    return (
        <Container>
            <Grid container direction="column" spacing={2}>
                <Grid item>
                    <Typography variant="h4">Settings</Typography>
                </Grid>
                <Grid item>
                    <Typography>To generate the OpenAI API key, please follow the instructions on <Link href="https://platform.openai.com/account/api-keys" target="_blank" rel="noopener noreferrer">this page</Link>.</Typography>
                </Grid>
                <Grid item>
                    <TextField
                        type="password"
                        label="OpenAI Key"
                        value={openAIKey}
                        onChange={handleOpenAIKeyChange}
                    />
                </Grid>
            </Grid>
        </Container>
    );
}

export default Settings;
