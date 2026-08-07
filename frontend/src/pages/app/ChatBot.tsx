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
  Drawer,
  Slider,
  Select,
  MenuItem,
  Divider,
  Collapse,
  Chip,
} from "@mui/material";
import {
  Logout,
  LightModeOutlined,
  DarkModeOutlined,
  Send,
  SettingsOutlined,
  Close,
  UploadFileOutlined,
  ExpandMore,
  ExpandLess,
} from "@mui/icons-material";
import { useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import ReactMarkdown from "react-markdown";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { useAppThemeContext } from "../../shared/context/ThemeContext";
import { M_STRIPE } from "../../shared/themes/Dark";
import {
  chatService,
  type Source,
  type TokenUsage,
} from "../../shared/services/api/chat/chatService";

interface Message {
  id: string;
  message: string;
  sender: "user" | "bot";
  sources?: Source[];
}

// Groq models the dropdown offers — must stay in sync with agent.py ALLOWED_MODELS.
const MODELS = [
  { value: "llama-3.3-70b-versatile", label: "Llama 3.3 70B (Groq)" },
  { value: "llama-3.1-8b-instant", label: "Llama 3.1 8B (Groq)" },
];

const ACCEPTED = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "text/plain": [".txt"],
  "text/markdown": [".md"],
  "text/csv": [".csv"],
};
const FILE_CHIPS = ["PDF", "DOCX", "TXT", "MD", "CSV"];

const TypingDots = () => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
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
            "0%, 80%, 100%": { transform: "scale(0.8)", opacity: 0.5 },
            "40%": { transform: "scale(1.4)", opacity: 1 },
          },
        }}
      />
    ))}
  </Box>
);

const Sources = ({ sources }: { sources: Source[] }) => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  return (
    <Box sx={{ mt: 1 }}>
      <Button
        size="small"
        onClick={() => setOpen((o) => !o)}
        endIcon={open ? <ExpandLess /> : <ExpandMore />}
        sx={{ p: 0, minHeight: 0, color: "text.secondary", fontSize: 12 }}
      >
        {sources.length} source{sources.length > 1 ? "s" : ""}
      </Button>
      <Collapse in={open}>
        <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 1 }}>
          {sources.map((s, i) => (
            <Box
              key={i}
              sx={{
                p: 1,
                border: `1px solid ${theme.palette.divider}`,
                fontSize: 12,
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {s.file}
                </Typography>
                <Chip
                  label={s.score.toFixed(3)}
                  size="small"
                  sx={{ borderRadius: 0, height: 18, fontSize: 10 }}
                />
              </Box>
              <Typography variant="caption" color="text.secondary">
                {s.text}
              </Typography>
            </Box>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
};

export const ChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [hasDoc, setHasDoc] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Tuning (sent to the backend)
  const [model, setModel] = useState(MODELS[0].value);
  const [topK, setTopK] = useState(5);
  const [chunkSize, setChunkSize] = useState(500);
  const [chunkOverlap, setChunkOverlap] = useState(50);
  const [confidence, setConfidence] = useState(0.35);
  const [tokens, setTokens] = useState<TokenUsage>({ prompt: 0, completion: 0, embedding: 0 });

  const theme = useTheme();
  const navigate = useNavigate();
  const { toggleTheme } = useAppThemeContext();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const pushBot = (message: string, sources?: Source[]) =>
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), message, sender: "bot", sources }]);

  const doUpload = async (file: File) => {
    setUploading(true);
    try {
      const res = await chatService.upload(file, chunkSize, chunkOverlap);
      setHasDoc(true);
      pushBot(
        `Document **${res.filename}** indexed (${res.chunks} chunk${res.chunks > 1 ? "s" : ""}). Ask me anything about it.`
      );
    } catch {
      pushBot("Failed to upload the document. Check the file type and size (max 10MB).");
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive, open: openFileDialog } = useDropzone({
    accept: ACCEPTED,
    maxFiles: 1,
    noClick: hasDoc, // only the hero dropzone is click-to-open
    onDrop: (files) => files[0] && doUpload(files[0]),
  });

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const text = input;
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), message: text, sender: "user" }]);
    setInput("");
    setLoading(true);
    try {
      const res = await chatService.ask({
        message: text,
        topK,
        model,
        confidenceThreshold: confidence,
      });
      pushBot(res.answer || "Sorry, I didn't understand.", res.sources);
      if (res.tokens)
        setTokens((t) => ({
          prompt: t.prompt + res.tokens.prompt,
          completion: t.completion + res.tokens.completion,
          embedding: t.embedding + res.tokens.embedding,
        }));
    } catch {
      pushBot("Error sending message, please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Cookies.remove("token");
    navigate("/");
  };

  return (
    <Box sx={{ height: "100vh", display: "flex", bgcolor: "background.default" }}>
      {/* Sidebar — BMW M identity preserved */}
      <Paper
        sx={{
          width: 300,
          bgcolor: "background.paper",
          display: "flex",
          flexDirection: "column",
          p: 3,
          borderRight: `1px solid ${theme.palette.divider}`,
          position: "relative",
        }}
      >
        <Box sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              bgcolor: "primary.main",
              width: 40,
              height: 40,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "primary.contrastText",
              fontWeight: 700,
              fontSize: 18,
              letterSpacing: "1px",
              userSelect: "none",
            }}
          >
            AI
          </Box>
          <Typography variant="h6" fontWeight={700} color="text.primary">
            AI Document RAG
          </Typography>
        </Box>
        <Box sx={{ height: 4, width: "100%", background: M_STRIPE, mb: 4 }} />

        <List sx={{ position: "absolute", bottom: 4, left: 0, width: "100%", px: 0 }}>
          <ListItem
            component={Button}
            onClick={() => setSettingsOpen(true)}
            sx={{ color: "text.primary", textTransform: "none", px: 2, py: 1 }}
          >
            <ListItemIcon sx={{ color: "text.primary", minWidth: 36 }}>
              <SettingsOutlined />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItem>
          <ListItem
            component={Button}
            onClick={toggleTheme}
            sx={{
              color: theme.palette.info.main,
              textTransform: "none",
              "&:hover": {
                bgcolor: theme.palette.info.main,
                color: "#fff",
                "& .MuiListItemIcon-root": { color: "#fff" },
              },
              px: 2,
              py: 1,
            }}
          >
            <ListItemIcon sx={{ color: theme.palette.info.main, minWidth: 36 }}>
              {theme.palette.mode === "dark" ? <LightModeOutlined /> : <DarkModeOutlined />}
            </ListItemIcon>
            <ListItemText primary="Switch Theme" />
          </ListItem>
          <ListItem
            component={Button}
            onClick={handleLogout}
            sx={{
              color: theme.palette.error.main,
              textTransform: "none",
              "&:hover": {
                bgcolor: theme.palette.error.main,
                color: "#fff",
                "& .MuiListItemIcon-root": { color: "#fff" },
              },
              px: 2,
              py: 1,
            }}
          >
            <ListItemIcon sx={{ color: theme.palette.error.main, minWidth: 36 }}>
              <Logout />
            </ListItemIcon>
            <ListItemText primary="Log out" />
          </ListItem>
        </List>
      </Paper>

      {/* Main area */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {messages.length === 0 ? (
          /* Hero empty-state with drag-drop dropzone */
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              p: 4,
            }}
          >
            <Typography variant="h4" color="text.primary" textAlign="center" gutterBottom>
              Talk to your documents
            </Typography>
            <Typography variant="body1" color="text.secondary" textAlign="center" mb={4}>
              Upload a document and ask questions. Powered by RAG with source citations.
            </Typography>
            <Box
              {...getRootProps()}
              sx={{
                width: "100%",
                maxWidth: 560,
                minHeight: 320,
                border: `1px dashed ${isDragActive ? theme.palette.secondary.main : theme.palette.divider}`,
                bgcolor: isDragActive ? "action.hover" : "transparent",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
                p: 4,
                transition: "border-color 0.2s",
              }}
            >
              <input {...getInputProps()} />
              <UploadFileOutlined sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
              <Typography variant="h6" color="text.primary">
                {uploading ? "Indexing…" : "Drop your document here"}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                or click to browse
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", justifyContent: "center" }}>
                {FILE_CHIPS.map((c) => (
                  <Chip key={c} label={c} size="small" sx={{ borderRadius: 0 }} />
                ))}
              </Box>
              <Typography variant="caption" color="text.secondary" mt={2}>
                Max file size: 10MB
              </Typography>
            </Box>
          </Box>
        ) : (
          /* Chat view */
          <Box
            sx={{
              flex: 1,
              maxWidth: 720,
              width: "100%",
              mx: "auto",
              display: "flex",
              flexDirection: "column",
              p: 2,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                flex: 1,
                p: 2,
                mb: 2,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 1,
                scrollbarWidth: "thin",
                "&::-webkit-scrollbar": { width: 6 },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: theme.palette.divider,
                },
              }}
            >
              {messages.map((msg) => (
                <Box
                  key={msg.id}
                  sx={{
                    alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                    bgcolor: msg.sender === "user" ? "secondary.main" : "background.paper",
                    border: msg.sender === "user" ? "none" : `1px solid ${theme.palette.divider}`,
                    color: msg.sender === "user" ? "secondary.contrastText" : "text.primary",
                    px: 1.5,
                    py: 0.5,
                    maxWidth: "80%",
                    animation: "fadeIn 0.4s ease-in",
                    "@keyframes fadeIn": {
                      from: { opacity: 0, transform: "translateY(5px)" },
                      to: { opacity: 1, transform: "translateY(0)" },
                    },
                    "& p": { my: 0.5 },
                    "& pre": { whiteSpace: "pre-wrap", overflowX: "auto" },
                    "& code": { fontSize: 13 },
                  }}
                >
                  <ReactMarkdown>{msg.message}</ReactMarkdown>
                  {msg.sources && msg.sources.length > 0 && <Sources sources={msg.sources} />}
                </Box>
              ))}
              {loading && (
                <Box
                  sx={{
                    alignSelf: "flex-start",
                    mt: 1,
                    bgcolor: "background.paper",
                    border: `1px solid ${theme.palette.divider}`,
                    p: 2,
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                >
                  <TypingDots />
                </Box>
              )}
              <div ref={bottomRef} />
            </Box>

            <Paper
              sx={{
                display: "flex",
                gap: 1,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <TextField
                fullWidth
                placeholder="Ask about your document…"
                value={input}
                multiline
                minRows={1}
                maxRows={5}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={loading}
                variant="standard"
                InputProps={{
                  disableUnderline: true,
                  startAdornment: (
                    <IconButton
                      color="primary"
                      onClick={openFileDialog}
                      disabled={uploading || loading}
                      title="Upload another document"
                    >
                      <UploadFileOutlined />
                    </IconButton>
                  ),
                  endAdornment: (
                    <IconButton color="primary" onClick={handleSend} disabled={loading || !input.trim()}>
                      <Send />
                    </IconButton>
                  ),
                }}
                sx={{ px: 2, py: 1, fontSize: 14 }}
              />
              {/* hidden dropzone input so drag-drop still works in chat view */}
              <input {...getInputProps()} />
            </Paper>
          </Box>
        )}
      </Box>

      {/* Settings drawer */}
      <Drawer anchor="right" open={settingsOpen} onClose={() => setSettingsOpen(false)}>
        <Box sx={{ width: 340, p: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Typography variant="h6">Settings</Typography>
            <IconButton onClick={() => setSettingsOpen(false)}>
              <Close />
            </IconButton>
          </Box>

          <Typography variant="body2" gutterBottom>
            LLM Model
          </Typography>
          <Select
            fullWidth
            size="small"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            sx={{ mb: 3, borderRadius: 0 }}
          >
            {MODELS.map((m) => (
              <MenuItem key={m.value} value={m.value}>
                {m.label}
              </MenuItem>
            ))}
          </Select>

          <Typography variant="body2">Top-K retrieval: {topK}</Typography>
          <Slider value={topK} min={1} max={10} step={1} onChange={(_, v) => setTopK(v as number)} sx={{ mb: 2 }} />

          <Typography variant="body2">Confidence threshold: {confidence.toFixed(2)}</Typography>
          <Slider
            value={confidence}
            min={0}
            max={1}
            step={0.05}
            onChange={(_, v) => setConfidence(v as number)}
            sx={{ mb: 3 }}
          />

          <Divider sx={{ mb: 2 }} />
          <Typography variant="body2">Chunk size: {chunkSize}</Typography>
          <Slider value={chunkSize} min={100} max={1000} step={50} onChange={(_, v) => setChunkSize(v as number)} sx={{ mb: 2 }} />

          <Typography variant="body2">Chunk overlap: {chunkOverlap}</Typography>
          <Slider value={chunkOverlap} min={0} max={200} step={10} onChange={(_, v) => setChunkOverlap(v as number)} sx={{ mb: 1 }} />
          <Typography variant="caption" color="text.secondary">
            Chunk settings apply to the next document you upload.
          </Typography>

          <Divider sx={{ my: 3 }} />
          <Typography variant="body2" gutterBottom>
            Token usage (session)
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="caption" color="text.secondary">Prompt</Typography>
            <Typography variant="caption">{tokens.prompt}</Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="caption" color="text.secondary">Completion</Typography>
            <Typography variant="caption">{tokens.completion}</Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="caption" color="text.secondary">Embedding</Typography>
            <Typography variant="caption">{tokens.embedding}</Typography>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
};
