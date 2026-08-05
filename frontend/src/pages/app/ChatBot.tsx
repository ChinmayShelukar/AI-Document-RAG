import {
  Box,
  TextField,
  IconButton,
  Typography,
  useTheme,
  Button,
  Paper,
  ListItemIcon,
  ListItemText,
  ListItem,
  List,
} from "@mui/material";
import {
  Logout,
  LightModeOutlined,
  DarkModeOutlined,
  Send,
  AttachFile,
} from "@mui/icons-material";
import { useEffect, useRef, useState } from "react";
import { api } from "../../shared/services/api/config/axios.config";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { useAppThemeContext } from "../../shared/context/ThemeContext";

interface Message {
  id: number;
  message: string;
  sender: "user" | "bot";
}

const TypingDots = () => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        ml: 0,
      }}
    >
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          sx={{
            width: 6,
            height: 6,
            bgcolor: "text.secondary",
            borderRadius: "50%",
            animation: "typing 1.5s infinite",
            animationDelay: `${i * 0.2}s`,
            "@keyframes typing": {
              "0%, 80%, 100%": {
                transform: "scale(0.8)",
                opacity: 0.5,
              },
              "40%": {
                transform: "scale(1.4)",
                opacity: 1,
              },
            },
          }}
        />
      ))}
    </Box>
  );
};

export const ChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [idCounter, setIdCounter] = useState(1);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const theme = useTheme();
  const navigate = useNavigate();
  const { toggleTheme } = useAppThemeContext();
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: idCounter,
      message: input,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setIdCounter((prev) => prev + 1);
    setInput("");
    setLoading(true);

    try {
      const response = await api.post("/chat-bot/ask/agent", {
        message: userMessage.message,
      });

      const botMessage: Message = {
        id: idCounter + 1,
        message: response.data.answer || "Sorry, I didn't understand.",
        sender: "bot",
      };

      setMessages((prev) => [...prev, botMessage]);
      setIdCounter((prev) => prev + 1);
      setLoading(false);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: idCounter + 1,
          message: "Error sending message, please try again later.",
          sender: "bot",
        },
      ]);
      setIdCounter((prev) => prev + 1);
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  const pushBotMessage = (message: string) => {
    setMessages((prev) => [
      ...prev,
      { id: idCounter + 1, message, sender: "bot" },
    ]);
    setIdCounter((prev) => prev + 1);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await api.post("/documents/upload", formData);
      pushBotMessage(
        `Document "${response.data.filename}" indexed (${response.data.chunks} section(s)). You can now ask questions about it.`
      );
    } catch (error) {
      pushBotMessage("Failed to upload the document, please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleLogout = () => {
    Cookies.remove("token");
    navigate("/");
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Paper
        sx={{
          width: 300,
          bgcolor: "background.paper",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          p: 3,
          boxShadow: "2px 0 8px rgba(0,0,0,0.05)",
          position: "relative",
        }}
      >
        {/* Logo + Title */}
        <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              bgcolor: theme.palette.primary.main,
              width: 40,
              height: 40,
              borderRadius: "8px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "#fff",
              fontWeight: "bold",
              fontSize: 20,
              userSelect: "none",
              pt: 0.5,
            }}
          >
            AI
          </Box>
          <Typography
            mt={1}
            variant="h6"
            fontWeight="bold"
            color="primary.main"
          >
            Check Docs
          </Typography>
        </Box>

        <List
          sx={{
            position: "absolute",
            bottom: 4,
            left: 0,
            width: "100%",
            px: 0,
          }}
        >
          <ListItem
            component={Button}
            onClick={toggleTheme}
            sx={{
              color: theme.palette.info.main,
              fontWeight: 600,
              textTransform: "none",
              "&:hover": {
                bgcolor: theme.palette.info.main,
                color: "#fff",
                boxShadow: `0 0 10px ${theme.palette.info.main}`,
                "& .MuiListItemIcon-root": {
                  color: "#fff", // force the icon to turn white on hover
                },
              },
              px: 2,
              py: 1,
            }}
          >
            <ListItemIcon
              sx={{
                color: theme.palette.info.main,
                minWidth: 36,
                mb: 0.8,
              }}
            >
              {theme.palette.mode === "dark" ? (
                <LightModeOutlined />
              ) : (
                <DarkModeOutlined />
              )}
            </ListItemIcon>
            <ListItemText primary="Switch Theme" />
          </ListItem>

          <ListItem
            component={Button}
            onClick={handleLogout}
            sx={{
              color: theme.palette.error.main,
              fontWeight: 600,
              textTransform: "none",
              "&:hover": {
                bgcolor: theme.palette.error.main,
                color: "#fff",
                boxShadow: `0 0 10px ${theme.palette.error.main}`,
                "& .MuiListItemIcon-root": {
                  color: "#fff", // force the icon to turn white on hover
                },
              },
              px: 2,
              py: 1,
            }}
          >
            <ListItemIcon
              sx={{
                color: theme.palette.error.main,
                minWidth: 36,
                mb: 0.6,
              }}
            >
              <Logout />
            </ListItemIcon>
            <ListItemText primary="Log out" />
          </ListItem>
        </List>
      </Paper>
      {/* Main Chat Area */}
      <Box
        sx={{
          flex: 1,
          maxWidth: 600,
          mx: "auto",
          display: "flex",
          flexDirection: "column",
          p: 2,
        }}
      >
        <Typography
          variant="h5"
          color="primary.main"
          textAlign="center"
          gutterBottom
        >
          Check Docs AI
        </Typography>

        <Box
          sx={{
            flex: 1,
            p: 2,
            mb: 2,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 1,
            scrollbarWidth: "thin", // Firefox
            "&::-webkit-scrollbar": {
              width: 6,
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: theme.palette.divider,
              borderRadius: 3,
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "transparent",
            },
          }}
        >
          {messages.length === 0 ? (
            <Box
              display="flex"
              height="100%"
              justifyContent="center"
              alignItems="center"
            >
              <Typography variant="body2" color="text.secondary" mt={4}>
                Send a question to get started.
              </Typography>
            </Box>
          ) : (
            messages.map((msg) => (
              <Box
                key={msg.id}
                sx={{
                  alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                  bgcolor: msg.sender === "user" ? "primary.main" : "#f0f0f0",
                  boxShadow: 3,
                  color: msg.sender === "user" ? "#fff" : "#000",
                  p: 1.2,
                  borderRadius: 2,
                  maxWidth: "75%",
                  whiteSpace: "pre-wrap",
                  animation: "fadeIn 0.4s ease-in",
                  "@keyframes fadeIn": {
                    from: { opacity: 0, transform: "translateY(5px)" },
                    to: { opacity: 1, transform: "translateY(0)" },
                  },
                }}
              >
                {msg.message}
                <div ref={bottomRef} />
              </Box>
            ))
          )}

          {loading && (
            <Box
              sx={{
                alignSelf: "flex-start",
                mt: 1,
                bgcolor: "#f0f0f0",
                color: "#000",
                p: 2,
                borderRadius: 2,
                mr: 1.5,
                maxWidth: "100%",
                display: "inline-flex",
                alignItems: "center",
                animation: "fadeIn 0.4s ease-in",
                whiteSpace: "nowrap",
                overflow: "hidden",
              }}
            >
              <TypingDots />
            </Box>
          )}
        </Box>

        <Paper sx={{ display: "flex", gap: 1, borderRadius: 3 }}>
          <input
            ref={fileInputRef}
            type="file"
            hidden
            accept=".txt,.pdf,.docx,.md"
            onChange={handleUpload}
          />
          <TextField
            fullWidth
            placeholder="Type your message..."
            value={input}
            multiline
            minRows={1}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={loading}
            variant="standard"
            InputProps={{
              disableUnderline: true,
              startAdornment: (
                <IconButton
                  color="primary"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || loading}
                  title="Upload a document"
                >
                  <AttachFile />
                </IconButton>
              ),
              endAdornment: (
                <IconButton
                  color="primary"
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                >
                  <Send />
                </IconButton>
              ),
            }}
            sx={{
              px: 2,
              py: 1,
              borderRadius: 3,
              boxShadow: "0 0 5px rgba(0,0,0,0.1)",
              fontSize: 14,
            }}
          />
        </Paper>
      </Box>
    </Box>
  );
};
