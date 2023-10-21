import React from 'react';
import { Card, CardActionArea, CardContent, Typography } from '@mui/material';
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
        </div>
    );
}

export default Home;
