import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { Outlet, RouterProvider, createBrowserRouter, Link } from 'react-router-dom'

import Settings from './Settings.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { AppBar, Toolbar, Typography } from '@mui/material';

function Root() {
    return (
        <>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div">anki card creator</Typography>
                    <Typography sx={{ marginLeft: 4 }}>
                        <Link to="/settings">Settings</Link>
                    </Typography>
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
