import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Card,
  CardHeader,
  CardContent
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Send as SendIcon,
  ArrowBack as ArrowBackIcon,
  AttachFile as AttachFileIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: '15px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  background: 'rgba(255, 255, 255, 0.98)',
  height: 'calc(100vh - 200px)',
  display: 'flex',
  flexDirection: 'column'
}));

const MessagesContainer = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  overflowY: 'auto',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2)
}));

const MessageBubble = styled(Box)(({ theme, isOwn }) => ({
  maxWidth: '80%',
  padding: theme.spacing(1.5),
  borderRadius: isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
  marginBottom: theme.spacing(1.5),
  backgroundColor: isOwn ? theme.palette.primary.main : '#f0f0f0',
  color: isOwn ? '#fff' : 'inherit',
  alignSelf: isOwn ? 'flex-end' : 'flex-start',
  wordBreak: 'break-word'
}));

const ChatPage = () => {
  const { id } = useParams(); // Chat ID
  const navigate = useNavigate();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  
  const [chat, setChat] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Connect to socket
  useEffect(() => {
    if (!user) return;
    
    // Setup socket connection
    socketRef.current = io('http://localhost:5000', {
      auth: {
        token: localStorage.getItem('token')
      }
    });
    
    socketRef.current.on('connect', () => {
      console.log('Connected to socket server');
      socketRef.current.emit('joinChat', id);
    });
    
    socketRef.current.on('error', (err) => {
      console.error('Socket error:', err);
      setError('שגיאת תקשורת');
    });
    
    socketRef.current.on('newMessage', (message) => {
      setMessages(prev => [...prev, message]);
    });
    
    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leaveChat', id);
        socketRef.current.disconnect();
      }
    };
  }, [user, id]);
  
  // Fetch chat data
  useEffect(() => {
    const fetchChat = async () => {
      if (!user) {
        navigate('/login');
        return;
      }
      
      try {
        setLoading(true);
        const response = await axios.get(`/api/chat/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        setChat(response.data);
        setMessages(response.data.messages);
      } catch (error) {
        console.error('Error fetching chat:', error);
        setError('לא ניתן לטעון את השיחה המבוקשת');
      } finally {
        setLoading(false);
      }
    };
    
    fetchChat();
  }, [id, navigate, user]);
  
  // Scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const sendMessage = (e) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    if (socketRef.current) {
      socketRef.current.emit('sendMessage', {
        chatId: id,
        content: message
      });
      setMessage('');
    } else {
      setError('בעיית תקשורת. נסה להתחבר מחדש');
    }
  };
  
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, mb: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>טוען שיחה...</Typography>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate(-1)} 
          sx={{ mt: 2 }}
        >
          חזרה
        </Button>
      </Container>
    );
  }
  
  if (!chat) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
        <Alert severity="warning">השיחה לא נמצאה</Alert>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate(-1)} 
          sx={{ mt: 2 }}
        >
          חזרה
        </Button>
      </Container>
    );
  }
  
  // Find the other participant
  const otherParticipant = chat.participants.find(
    participant => participant._id !== user._id
  );
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate(-1)}
        color="inherit"
        sx={{ mb: 2 }}
      >
        חזרה
      </Button>
      
      {chat.card && (
        <Card sx={{ mb: 3 }}>
          <CardHeader
            title={
              <Typography variant="h6">
                {chat.card.cardType === 'request' ? 'בקשה: ' : 'תרומה: '}
                {chat.card.itemName}
              </Typography>
            }
            subheader={
              <Typography variant="body2" color="text.secondary">
                {chat.card.location.address}
              </Typography>
            }
          />
        </Card>
      )}
      
      <StyledPaper>
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)' 
        }}>
          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
            {otherParticipant?.username?.charAt(0).toUpperCase() || 'U'}
          </Avatar>
          <Typography variant="h6">
            {otherParticipant?.username || 'משתמש אחר'}
          </Typography>
        </Box>
        
        <MessagesContainer>
          {messages.length === 0 ? (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              height: '100%', 
              color: 'text.secondary' 
            }}>
              <Typography variant="body1" textAlign="center">
                אין הודעות עדיין. שלח הודעה כדי להתחיל את השיחה!
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {messages.map((msg, index) => {
                const isOwn = msg.sender._id === user._id || msg.sender === user._id;
                const senderName = isOwn ? 'אתה' : (
                  msg.sender.username || otherParticipant?.username || 'משתמש אחר'
                );
                
                const messageDate = new Date(msg.timestamp).toLocaleTimeString('he-IL', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                });
                
                return (
                  <Box 
                    key={index} 
                    sx={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isOwn ? 'flex-end' : 'flex-start',
                      mb: 1
                    }}
                  >
                    <MessageBubble isOwn={isOwn}>
                      <Typography variant="body1">{msg.content}</Typography>
                    </MessageBubble>
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ mx: 1, mb: 1 }}
                    >
                      {isOwn ? messageDate : `${senderName}, ${messageDate}`}
                    </Typography>
                  </Box>
                );
              })}
              <div ref={messagesEndRef} />
            </Box>
          )}
        </MessagesContainer>
        
        <Box component="form" onSubmit={sendMessage} sx={{ 
          p: 2, 
          display: 'flex',
          alignItems: 'center',
          borderTop: '1px solid rgba(0, 0, 0, 0.1)'
        }}>
          <TextField
            fullWidth
            placeholder="הקלד הודעה..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ mr: 1 }}
          />
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            disabled={!message.trim()}
            endIcon={<SendIcon />}
          >
            שלח
          </Button>
        </Box>
      </StyledPaper>
    </Container>
  );
};

export default ChatPage;