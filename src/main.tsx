import React, { createContext } from 'react'
import useLocalStorage from './useLocalStorage';
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { Outlet, RouterProvider, createBrowserRouter, Link } from 'react-router-dom'

export const OpenAIKeyContext = createContext();

function Root() {
    const [openAIKey, setOpenAIKey] = useLocalStorage('openAIKey', '');
    return (
        <OpenAIKeyContext.Provider value={{ openAIKey, setOpenAIKey }}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component={Link} to="/" color="inherit" sx={{ textDecoration: 'none' }}>anki card creator</Typography>
                    <Typography sx={{ marginLeft: 4, textDecoration: 'none' }} component={Link} to="/settings" color="inherit">Settings</Typography>
                </Toolbar>
            </AppBar>
            <Outlet />
        </OpenAIKeyContext.Provider>
    );
}

import Settings from './Settings.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { AppBar, Toolbar, Typography } from '@mui/material';

function Root() {
    return (
        <>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component={Link} to="/" color="inherit" sx={{ textDecoration: 'none' }}>anki card creator</Typography>
                    <Typography sx={{ marginLeft: 4, textDecoration: 'none' }} component={Link} to="/settings" color="inherit">Settings</Typography>
                </Toolbar>
            </AppBar>
            <Outlet />
        </>
    );
}

const router = createBrowserRouter([
    {
        path: "/",
        element: <Root />,
        children: [
            {
                path: "",
                element: <App />,
            },
            {
                path: "settings",
                element: <Settings />,
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
