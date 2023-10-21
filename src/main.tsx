import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { Outlet, RouterProvider, createBrowserRouter, Link } from 'react-router-dom'
import Settings from './Settings.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppBar, Toolbar, Typography, Container } from '@mui/material';
import OpenAIKeyContextProvider from './OpenAIKeyContext';
import Home from './Home.tsx';

function Root() {
    return (
        <OpenAIKeyContextProvider>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component={Link} to="/" color="inherit" sx={{ textDecoration: 'none' }}>anki card creator</Typography>
                    <Typography sx={{ marginLeft: 4, textDecoration: 'none' }} component={Link} to="/settings" color="inherit">Settings</Typography>
                </Toolbar>
            </AppBar>
            <Container>
                <Outlet />
            </Container>
        </OpenAIKeyContextProvider>
    );
}

const router = createBrowserRouter([
    {
        path: "/",
        element: <Root />,
        children: [
            {
                path: "",
                element: <Home />,
            },
            {
                path: "settings",
                element: <Settings />,
            },
            {
                path: "suggest",
                element: <App />,
            },
        ],
    },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <QueryClientProvider client={new QueryClient()}>
            <RouterProvider router={router} />
        </QueryClientProvider>
    </React.StrictMode>
);
