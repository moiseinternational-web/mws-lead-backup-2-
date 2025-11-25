import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { Send, Bot, User, Loader2, RotateCcw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

const ChatPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
    const chatSessionKey = user ? `mws-chat-session-${user.id}` : null;

    const [messages, setMessages] = useState<ChatMessage[]>(() => {
        if (!chatSessionKey) return [];
        try {
            const savedMessages = sessionStorage.getItem(chatSessionKey);
            return savedMessages ? JSON.parse(savedMessages) : [];
        } catch (e) {
            console.error("Could not load chat from session storage:", e);
            return [];
        }
    });

    const [chat, setChat] = useState<Chat | null>(null);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const initializeChat = (history: ChatMessage[]) => {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const chatHistory = history
                .filter(m => m.text.trim() !== '')
                .map(m => ({
                    role: m.role,
                    parts: [{ text: m.text }]
                }));

            const chatSession = ai.chats.create({
                model: 'gemini-2.5-flash',
                history: chatHistory,
                config: {
                    systemInstruction: t('page_chat.system_instruction', { username: user?.username || 'user', lng: i18n.language }),
                },
            });
            setChat(chatSession);
            setError(''); // Clear previous errors
        } catch (e: any) {
            console.error("Initialization error:", e);
            setError(t('page_chat.init_error'));
            setChat(null);
        }
    };

    useEffect(() => {
        initializeChat(messages);
        if (messages.length === 0 && user?.username) {
            setMessages([
                {
                    role: 'model',
                    text: t('page_chat.initial_greeting', { username: user.username })
                }
            ]);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, i18n.language]); // Re-initialize when the user ID or language changes


    useEffect(() => {
        if (chatSessionKey) {
            try {
                sessionStorage.setItem(chatSessionKey, JSON.stringify(messages));
            } catch (e) {
                console.error("Could not save chat to session storage:", e);
            }
        }
    }, [messages, chatSessionKey]);


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages, isLoading]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading || !chat) return;

        const userMessage: ChatMessage = { role: 'user', text: userInput };
        setMessages(prev => [...prev, userMessage]);
        setUserInput('');
        setIsLoading(true);
        setError('');

        try {
            const responseStream = await chat.sendMessageStream({ message: userInput });
            
            let currentBotMessage = '';
            setMessages(prev => [...prev, { role: 'model', text: '' }]);

            for await (const chunk of responseStream) {
                currentBotMessage += chunk.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].text = currentBotMessage;
                    return newMessages;
                });
            }
        } catch (e: any) {
            console.error("Error sending message:", e);
            setError(t('page_chat.send_error'));
            // Remove the empty bot message placeholder on error
            setMessages(prev => prev.slice(0, prev.length -1));
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetChat = () => {
        if (window.confirm(t('page_chat.confirm_reset'))) {
            setIsLoading(false); // Stop any ongoing loading
            if (chatSessionKey) {
                sessionStorage.removeItem(chatSessionKey);
            }
            const initialMessages = [{
                role: 'model' as const,
                text: t('page_chat.initial_greeting', { username: user?.username || '' })
            }];
            setMessages(initialMessages);
            initializeChat([]); // Re-initialize chat with empty history
        }
    };

    const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
        const isUser = message.role === 'user';
        return (
            <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : ''}`}>
                {!isUser && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white">
                        <Bot size={20} />
                    </div>
                )}
                <div
                    className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${
                        isUser
                            ? 'bg-primary-600 text-white rounded-br-lg'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-gray-200 rounded-bl-lg'
                    }`}
                >
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                </div>
                 {isUser && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-white">
                        <User size={20} />
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 max-w-4xl mx-auto flex flex-col h-[calc(100vh-10rem)]">
            <div className="flex items-center space-x-3 p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                <Bot className="w-8 h-8 text-primary-500 dark:text-primary-400" />
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('page_chat.title')}</h2>
                    <p className="text-xs text-green-500 font-semibold flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
                        {t('page_chat.online')}
                    </p>
                </div>
                <button
                    onClick={handleResetChat}
                    className="ml-auto p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    title={t('page_chat.reset_tooltip')}
                    aria-label={t('page_chat.reset_tooltip')}
                >
                    <RotateCcw className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
            </div>
            
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
                {messages.map((msg, index) => (
                    <MessageBubble key={index} message={msg} />
                ))}
                 {isLoading && (
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white">
                            <Bot size={20} />
                        </div>
                        <div className="max-w-xs px-4 py-3 rounded-2xl rounded-bl-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-gray-200">
                           <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {error && (
                <div className="px-4 py-2 text-sm text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-300 border-t border-slate-200 dark:border-slate-700">
                    {error}
                </div>
            )}
            
            <div className="flex-shrink-0 p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder={t('page_chat.placeholder')}
                        className="flex-1 w-full p-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        disabled={isLoading || !chat}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !userInput.trim() || !chat}
                        className="w-12 h-12 flex items-center justify-center bg-primary-600 text-white rounded-full shadow hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                        aria-label={t('page_chat.send_aria_label')}
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatPage;
