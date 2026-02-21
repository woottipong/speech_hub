import React, { createContext, useContext, useState, useEffect } from 'react';
import { ALL_TTS_VOICES, ALL_GEMINI_TTS_VOICES } from './constants';

const TTSContext = createContext();

export function TTSProvider({ children }) {
    const [provider, setProvider] = useState('azure'); // 'azure' | 'gemini'
    
    // Shared Text Input State
    const [text, setText] = useState('');
    const [instruction, setInstruction] = useState('');

    // Single Mode States
    const [voice, setVoice] = useState(ALL_TTS_VOICES[0].value);
    const [geminiVoice, setGeminiVoice] = useState(ALL_GEMINI_TTS_VOICES[0].value);
    const [style, setStyle] = useState('');

    // Dialogue Mode States (Gemini only)
    const [isDialogueMode, setIsDialogueMode] = useState(false);
    const [speaker1Name, setSpeaker1Name] = useState('สมชาย');
    const [speaker1Voice, setSpeaker1Voice] = useState('Kore');
    const [speaker2Name, setSpeaker2Name] = useState('มานี');
    const [speaker2Voice, setSpeaker2Voice] = useState('Puck');

    // Reset dialogue mode when switching away from Gemini
    useEffect(() => {
        if (provider !== 'gemini' && isDialogueMode) {
            setIsDialogueMode(false);
        }
    }, [provider, isDialogueMode]);

    return (
        <TTSContext.Provider value={{
            provider, setProvider,
            text, setText,
            instruction, setInstruction,
            voice, setVoice,
            geminiVoice, setGeminiVoice,
            style, setStyle,
            isDialogueMode, setIsDialogueMode,
            speaker1Name, setSpeaker1Name,
            speaker1Voice, setSpeaker1Voice,
            speaker2Name, setSpeaker2Name,
            speaker2Voice, setSpeaker2Voice
        }}>
            {children}
        </TTSContext.Provider>
    );
}

export function useTTS() {
    return useContext(TTSContext);
}
