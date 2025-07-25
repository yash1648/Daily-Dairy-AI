// Save this for your frontend work later
const socket = new WebSocket('ws://localhost:6969/ws/ai-chat');

socket.onmessage = (e) => {
    const data = JSON.parse(e.data);
    switch(data.type) {
        case 'chunk':
            setResponse(prev => prev + data.content);
            break;
        case 'complete':
            setIsLoading(false);
            break;
        case 'error':
            setError(data.message);
            break;
    }
};
