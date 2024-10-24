
"use client"; // Mark this component as a Client Component

import React, { useState, ChangeEvent, FormEvent, DragEvent } from 'react';

import Image from 'next/image';


import '../app/globals.css'; // Ensure correct path for styles
import { FaFilePdf, FaArrowLeft, FaPlus, FaCopy, FaBars, FaChevronLeft, FaTrashAlt, FaDownload } from 'react-icons/fa'; // Importing icons except FaUser and FaRobot
interface ChatPDFInterfaceProps {
    setShowChat: (show: boolean) => void; // Define prop type
  }

const ChatPDFInterface: React.FC<ChatPDFInterfaceProps> = ({ setShowChat }) =>  {
    const [activeTab, setActiveTab] = useState<'chat' | 'pdf'>('chat');
    const [input, setInput] = useState<string>('');
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [responses, setResponses] = useState<{ user: string; bot: string }[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [pdfQuestion, setPdfQuestion] = useState<string>('');
    const [savedChats, setSavedChats] = useState<{ id: number; title: string; responses: { user: string; bot: string }[] }[]>([]);
    const [currentChatId, setCurrentChatId] = useState<number | null>(null);
    const [isPdfUploadVisible, setIsPdfUploadVisible] = useState<boolean>(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const handleBack = () => {
        setShowChat(false); // Set showChat to false when going back
      };
    // const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
  
    
  

    const handleTabChange = (tab: 'chat' | 'pdf') => {
        setActiveTab(tab);
        
        // When switching tabs, save the current chat responses
        if (currentChatId !== null) {
            setSavedChats(prevChats =>
                prevChats.map(chat =>
                    chat.id === currentChatId ? { ...chat, responses } : chat
                )
            );
        }
    
        setInput('');
        setResponses([]);
        setPdfFile(null);
        setPdfQuestion('');
        
    };
    
    const handleNewChat = (event: FormEvent) => {
        event.preventDefault(); // Prevent default form submission behavior
    
        const chatTitle = input.length > 0 ? (input.length > 15 ? input.slice(0, 15) : input) : `Chat ${savedChats.length + 1}`;
    
        // Save the current chat before starting a new one
        if (currentChatId !== null) {
            const updatedChats = savedChats.map(chat =>
                chat.id === currentChatId ? { ...chat, responses: responses } : chat
            );
            setSavedChats(updatedChats);
        } else if (responses.length > 0) {
            // Handle the case where there isn't a currentChatId (initial chat)
            setSavedChats([...savedChats, { id: 1, title: 'Chat 1', responses: responses }]);
        }
    
        // Create a new chat
        const newChatId = savedChats.length + 1;
        setSavedChats([...savedChats, { id: newChatId, title: chatTitle, responses: [] }]);
        setCurrentChatId(newChatId);
        setInput('');
        setResponses([]); // Clear responses for the new chat
    };
    
    const switchChat = (chatId: number) => {
        // Save the current chat responses before switching
        if (currentChatId !== null) {
            setSavedChats(prevChats =>
                prevChats.map(chat =>
                    chat.id === currentChatId ? { ...chat, responses } : chat
                )
            );
        }
    
        // Switch to the selected chat and load its responses
        const selectedChat = savedChats.find(chat => chat.id === chatId);
        if (selectedChat) {
            setCurrentChatId(chatId);
            setResponses(selectedChat.responses || []);
        }
    };
    
    const handleChatSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!input.trim()) return;
    
        // Step 1: Immediately display user input
        const userResponse = { user: input, bot: '', time: new Date().toLocaleTimeString() };
        setResponses((prev) => [...prev, userResponse]);
    
        // Step 2: Clear input and set loading state
        setInput('');
        setLoading(true);
    
        try {
            // Step 3: Fetch bot response using the environment variable for the API URL
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: input }),
            });
    
            if (!res.ok) throw new Error(await res.text());
    
            const data = await res.json();
            const botResponse = data.text || 'No response received';
    
            // Step 4: Update responses with the bot's reply
            setResponses((prev) => {
                const updatedResponses = [...prev];
                updatedResponses[updatedResponses.length - 1].bot = botResponse; // Update last response with bot reply
                return updatedResponses;
            });
    
            // Update saved chats if currentChatId is not null
            if (currentChatId !== null) {
                setSavedChats((prev) =>
                    prev.map((chat) =>
                        chat.id === currentChatId ? { ...chat, responses: [...responses, { user: input, bot: botResponse }] } : chat
                    )
                );
            }
        } catch (error) {
            console.error('Error fetching response:', error);
        } finally {
            // Step 5: Reset loading state
            setLoading(false);
        }
    };
    
    const handlePdfUpload = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!pdfFile) {
            return;
        }
        if (!pdfQuestion.trim()) {
            return;
        }
    
        // Step 1: Immediately display the user's PDF question
        const userResponse = { user: pdfQuestion, bot: '', time: new Date().toLocaleTimeString() };
        setResponses((prev) => [...prev, userResponse]);
    
        // Step 2: Clear input and set loading state
        setPdfQuestion('');
        setLoading(true);
        
        const formData = new FormData();
        formData.append('file', pdfFile);
    
        try {
            // Step 3: Upload PDF using the environment variable for the API URL
            const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/upload-pdf`, {
                method: 'POST',
                body: formData,
            });
    
            if (!uploadRes.ok) throw new Error(await uploadRes.text());
    
            const uploadData = await uploadRes.json();
            if (!uploadData.pdf_path) throw new Error('PDF upload failed. No path returned.');
    
            // Step 4: Query the PDF using the environment variable for the API URL
            const queryRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/pdf-query`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pdf_path: uploadData.pdf_path, message: pdfQuestion }),
            });
    
            if (!queryRes.ok) throw new Error(await queryRes.text());
    
            const queryData = await queryRes.json();
            const pdfBotResponse = queryData.text || 'No response received';
    
            // Step 5: Update responses with the bot's reply
            setResponses((prev) => {
                const updatedResponses = [...prev];
                updatedResponses[updatedResponses.length - 1].bot = pdfBotResponse; // Update last response with bot reply
                return updatedResponses;
            });
        } catch (error) {
            console.error('Error handling PDF:', error);
        } finally {
            // Step 6: Reset loading state
            setLoading(false);
        }
    };
    

    const handleFileDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        if (event.dataTransfer.files.length > 0) {
            setPdfFile(event.dataTransfer.files[0]);
        }
    };

    const handleFileClick = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setPdfFile(event.target.files[0]);
        }
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);

    };

    const togglePdfUpload = () => {
        handleTabChange('pdf');
        setIsPdfUploadVisible(!isPdfUploadVisible);
    };
       // Function to clear chat
       const clearChat = () => {
        setResponses([]); // Clear the chat responses
        console.log("Chat cleared");
    };

   // Function to download chat as a .txt file
   const downloadChat = async () => {
    const chatContent = responses.map(res => `User: ${res.user}\nBot: ${res.bot}`).join('\n\n');

    try {
        let dirHandle;
        // Check if window and showDirectoryPicker are available
        if (typeof window !== "undefined" && 'showDirectoryPicker' in window) {
            // Prompt the user to select a directory
            dirHandle = await window.showDirectoryPicker();
        } else {
            console.error("showDirectoryPicker is not supported in this environment.");
            // Optionally, provide alternative behavior here
            return;
        }

        // Create a new file in the selected directory
        const fileHandle = await dirHandle.getFileHandle('chat.txt', { create: true });

        // Create a writable stream
        const writable = await fileHandle.createWritable();

        // Write the chat content to the file
        await writable.write(chatContent);

        // Close the file and release the lock
        await writable.close();

        console.log('Chat saved successfully');
    } catch (error) {
        console.error('Error saving chat:', error);
    }
};





    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
        {/* Header */}
        <div style={{ width: '100%', padding: '16px', backgroundColor: 'black', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'fixed', top: 0, zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                
                    <Image src="/logo.png" alt="Bot Logo" width={80} height={80} />

                    
                <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginLeft: '8px' }}>Ask Audacity</h1>
                
  <button
          onClick={handleBack} // Use handleBack to navigate

    style={{
      display: 'flex',
      alignItems: 'center',
      marginLeft: '16px',
      padding: '10px 16px',
      background: 'linear-gradient(135deg, black, gray)',
      color: 'white',
      borderRadius: '50px',
      border: 'none',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
      cursor: 'pointer',
      transition: 'transform 0.2s',
    }}
    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
  >
    <FaArrowLeft style={{ marginRight: '8px' }} />
    Back
  </button>
                 {/* Switch to PDF Button */}
            <button
                onClick={togglePdfUpload}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginLeft: '1300px',
                    padding: '10px 16px',
                    background: 'linear-gradient(135deg, blue, green)',
                    color: 'white',
                    borderRadius: '50px',
                    border: 'none',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
                Switch to PDF
            </button>
            </div>

            <div className="flex space-x-4">
                <button onClick={toggleSidebar} className="p-2 bg-transparent">
                    <FaBars size={24} className="text-white" />
                </button>
                
            </div>
        </div>
        

            {/* Body (below the header) */}
            {/* Body (below the header) */}
<div className="flex flex-grow pt-[80px] relative">

{/* FaBars button to open the sidebar */}
{!isSidebarOpen && (
  <button 
    onClick={toggleSidebar} 
    style={{
      padding: '0.5rem', 
      background: 'transparent', 
      cursor: 'pointer',
      position: 'fixed', 
      top: '90px', 
      left: '10px', // Always in the same position
      transition: 'left 0.3s ease-in-out', 
      zIndex: 1000 
    }}
  >
    <FaBars style={{ fontSize: '22px', color: '#1a1a1a' }} />
  </button>
)}

{/* Sidebar */}
{isSidebarOpen && (
  <div 
    className="w-1/4 min-w-[250px] max-w-[300px] p-4 border-r border-gray-300 bg-white/90 backdrop-blur-sm h-screen overflow-y-auto"
    style={{
      flexShrink: 0, 
      scrollBehavior: 'smooth',
      overflowX: 'hidden',
      overflowY: 'auto',
    }}
  >
    {/* Sidebar header and content */}
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <button 
        onClick={toggleSidebar} 
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingRight: '10px',
        }}
      >
        <FaChevronLeft style={{ fontSize: '22px', color: '#1a1a1a' }} />
      </button>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1a1a1a' }}>Chats</h2>
    </div>





                        <form onSubmit={handleNewChat}>
     

                            <input
                                type="text"
                                value={input}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
                                placeholder="Enter chat title..."
                                className="w-full border border-gray-300 rounded p-2 mb-2"
                            />
                            
                            <button 
    type="submit" 
    style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px 16px',
        width: '100%',
        background: 'linear-gradient(135deg, black, gray)',
        color: 'white',
        borderRadius: '50px',
        border: 'none',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        cursor: 'pointer',
        transition: 'transform 0.2s',
        marginBottom: '16px'
    }}
    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
>
    <FaPlus style={{ marginRight: '8px' }} /> New Chat
</button> <br></br>
{/* Row for Clear Chat and Download Chat buttons */}
<div style={{ display: 'flex', gap: '8px' }}>
                <button
                    type="button"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '10px 16px',
                        width: '70%',
                        background: 'linear-gradient(135deg, red, gray)',
                        color: 'white',
                        borderRadius: '50px',
                        border: 'none',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                        cursor: 'pointer',
                        transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    onClick={clearChat}
                >
                    <FaTrashAlt style={{ marginRight: '8px' }} /> Clear Chat
                </button>

               
            </div> <br></br>
            <button
                    type="button"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '10px 16px',
                        width: '70%',
                        background: 'linear-gradient(135deg, green, gray)',
                        color: 'white',
                        borderRadius: '50px',
                        border: 'none',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                        cursor: 'pointer',
                        transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    onClick={downloadChat}
                >
                    <FaDownload style={{ marginRight: '8px' }} /> Download Chat
                </button> 
                            <br></br><h2 className="text-lg font-bold text-gray-900">Saved Chats</h2>

                        </form>

                        {/* PDF Upload Area */}
                        {isPdfUploadVisible && (
                            <div 
                                className="border-dashed border-2 p-4 text-center mt-4 bg-white/60 backdrop-blur-sm"
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleFileDrop}
                            >
                                {pdfFile ? (
                                    <p className="font-semibold">{pdfFile.name}</p>
                                ) : (
                                    <>
                                        <p className="font-semibold">Drag and drop PDF</p>
                                        <FaFilePdf size={30} className="text-gray-500 mx-auto my-2" />
                                        <input
                                            type="file"
                                            accept=".pdf"
                                            className="w-full text-center mt-2"
                                            onChange={handleFileClick}
                                        />
                                    </>
                                )}
                            </div>
                        )}

                        {/* Saved Chats */}
                        <ul className="chat-list mt-4">
    {savedChats.map(chat => (
        <li
            key={chat.id}
            className="cursor-pointer p-2 hover:bg-gray-100 rounded"
            onClick={() => switchChat(chat.id)} // Call switchChat with the chat ID
        >
            {chat.title}
        </li>
    ))}
</ul>

                    </div>
                )}

                {/* Main Content */}
                
                <div style={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f9f9f9',
        paddingTop: '5px', // Adjust this value based on your header height
    }}>
        
        
               
                    <div style={{
            flexGrow: 1,
            overflowY: 'auto',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '50px',
            maxHeight: 'calc(100vh - 200px)',
        }}>
                        <div className="flex flex-col space-y-4">
                      
                            {responses.map((resp, index) => (
                                <div key={index} className="flex flex-col space-y-2">
                                    
                                    {/* User Message */}
                                    <div className="flex items-center justify-end">
                                        
                                        <div className="flex items-center">
                                        
                                       
                                            <video
                                                className="mr-2 w-6 h-6"
                                                style={{ width: '50px', height: '50px' }} // Custom size
                                                src="/speech-bubble.mp4"
                                                autoPlay
                                                loop
                                                muted
                                            />
                                            <div className="bg-blue-100 p-2 rounded">
                                                {resp.user}
                                            </div>
                                            <span className="text-xs text-gray-500 ml-2">{new Date().toLocaleTimeString()}</span>
                                        </div>
                                        <FaCopy
                                            className="ml-2 cursor-pointer"
                                            onClick={() => navigator.clipboard.writeText(resp.user)}
                                        />
                                    </div>

                                    
                                    {/* Bot Response */}
                                    <div className="flex items-center justify-start">
                                   
                                        <div className="flex items-center">
                                        
                                            <video
                                                className="mr-2 w-6 h-6"
                                                style={{ width: '50px', height: '50px' }} // Custom size

                                                src="/chatbot.mp4"
                                                autoPlay
                                                loop
                                                muted
                                            />
                                            
                                             
                                            <div className="bg-gray-200 p-2 rounded">

                                                {resp.bot}
                                            </div>
                                            <span className="text-xs text-gray-500 ml-2">{new Date().toLocaleTimeString()}</span>
                                        </div>
                                        
                                    </div>
                                    <FaCopy
                                            className="ml-2 cursor-pointer"
                                            onClick={() => navigator.clipboard.writeText(resp.bot)}
                                        />
                                </div>
                            ))}
                           
                        </div>
                        <style>
    {`
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `}
</style>

{/* Loading Spinner */}
{loading && responses && (
    <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100px', // Adjust height as needed
    }}>
        <div style={{
            border: '5px solid rgba(0, 0, 0, 0.1)', // Light gray border
            borderLeftColor: '#007bff', // Blue border for animation
            borderRadius: '50%',
            width: '40px', // Adjust size as needed
            height: '40px', // Adjust size as needed
            animation: 'spin 1s linear infinite' // Spin animation
        }} />
    </div>
)}

                        
                    </div>

                    {/* Chat Input Form */}
{activeTab === 'chat' && (
    
    <form className="flex items-center p-4 border-t" onSubmit={handleChatSubmit}>
        <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Anything to Audacity..."
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
         
        <button
            type="submit"
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px 16px',
                width: '10%',

                background: 'linear-gradient(135deg, green, gray)',
                color: 'white',
                borderRadius: '50px',
                border: 'none',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                marginLeft: '8px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            disabled={loading}
        >
            Send
        </button>
    </form>
                    )}

                    {/* PDF Query Form */}
{activeTab === 'pdf' && (
    <form className="flex items-center p-4 border-t" onSubmit={handlePdfUpload}>
        <input
            type="text"
            value={pdfQuestion}
            onChange={(e) => setPdfQuestion(e.target.value)}
            placeholder="Ask a question about the PDF..."
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <button
            type="submit"
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px 16px',
                width: '10%',
                background: 'linear-gradient(135deg, green, gray)',
                color: 'white',
                borderRadius: '50px',
                border: 'none',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                marginLeft: '8px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            disabled={loading}
        >
            Ask PDF
        </button>
    </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatPDFInterface;
