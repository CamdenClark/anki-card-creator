import React from 'react';
import { Card, CardActionArea, CardContent, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Home() {
    const navigate = useNavigate();

    return (
        <Card sx={{ maxWidth: 345, borderRadius: 2, margin: 'auto', marginTop: 5 }}>
            <CardActionArea onClick={() => navigate('/suggest')}>
                <CardContent>
                    <Typography variant="h5" component="div" align="center">
                        Suggest cards with AI
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    );
}

export default Home;
