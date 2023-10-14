import React, { createContext } from 'react'
import useLocalStorage from './useLocalStorage';

export const OpenAIKeyContext = createContext();

function OpenAIKeyContextProvider({ children }) {
    const [openAIKey, setOpenAIKey] = useLocalStorage('openAIKey', '');
    return (
        <OpenAIKeyContext.Provider value={{ openAIKey, setOpenAIKey }}>
            {children}
        </OpenAIKeyContext.Provider>
    );
}

export default OpenAIKeyContextProvider;
