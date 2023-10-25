import React from 'react';
import { Card, CardActionArea, CardContent, Typography, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Home() {
    const navigate = useNavigate();

    return (
        <div>
            <Typography variant="h6" component="p" align="center" sx={{ marginTop: 5 }}>
                Anki Card Creator is a tool that helps you create Anki cards quickly and easily using AI.
            </Typography>
            <Card sx={{ maxWidth: 345, borderRadius: 2, margin: 'auto', marginTop: 5 }}>
                <CardActionArea onClick={() => navigate('/suggest')}>
                    <CardContent>
                        <Typography variant="h5" component="div" align="center">
                            Suggest cards with AI
                        </Typography>
                    </CardContent>
                </CardActionArea>
            </Card>
            <Typography variant="body1" sx={{ marginTop: 5 }}>
                Installation Steps:
            </Typography>
            <Typography variant="body1" sx={{ marginTop: 2 }}>
                1. Have Anki installed on your local machine
            </Typography>
            <Typography variant="body1" sx={{ marginTop: 2 }}>
                2. Have the <Link href="https://ankiweb.net/shared/info/2055492159" target="_blank" rel="noopener noreferrer">AnkiConnect</Link> plugin installed in your local Anki
            </Typography>
            <Typography variant="body1" sx={{ marginTop: 2 }}>
                3. Set up Anki Connect to have CORS enabled for the route. Go to Tools -{'>'} Add-ons -{'>'} Select AnkiConnect -{'>'} Click Config -{'>'} Add "anki-card-creator.pages.dev" to your webCorsOriginList
            </Typography>
            <Typography variant="body1" sx={{ marginTop: 2 }}>
                4. Create and add an OpenAI API key to the Settings page
            </Typography>
        </div>
    );
}

export default Home;
