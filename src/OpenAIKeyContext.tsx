import { ReactNode, createContext } from 'react'
import useLocalStorage from './useLocalStorage';

interface OpenAIKeyContextProps {
  openAIKey: string;
  setOpenAIKey: (value: string) => void;
}

export const OpenAIKeyContext = createContext<OpenAIKeyContextProps>({ openAIKey: "", setOpenAIKey: () => {}});

interface OpenAIKeyContextProviderProps {
    children: ReactNode;
}


function OpenAIKeyContextProvider({ children }: OpenAIKeyContextProviderProps) {
    const [openAIKey, setOpenAIKey] = useLocalStorage('openAIKey', '');
    return (
        <OpenAIKeyContext.Provider value={{ openAIKey, setOpenAIKey }}>
            {children}
        </OpenAIKeyContext.Provider>
    );
}

export default OpenAIKeyContextProvider;
