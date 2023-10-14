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

function Root() {
    return (
        <React.StrictMode>
            <QueryClientProvider client={new QueryClient()}>
                <RouterProvider router={router} />
            </QueryClientProvider>
        </React.StrictMode>
    );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<Root />)
