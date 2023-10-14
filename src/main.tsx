import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'

import Settings from './Settings.tsx';

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                path: "settings",
                element: <Settings />,
            },
        ],
    },
]);

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { AppBar, Toolbar, Typography } from '@mui/material';
import { Outlet } from 'react-router-dom';

function Root() {
    return (
        <>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div">
                        My App
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
