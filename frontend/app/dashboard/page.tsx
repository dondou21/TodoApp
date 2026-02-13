"use client";

import { useEffect, useState } from "react";
import {
    AppBar,
    Box,
    Button,
    Checkbox,
    Container,
    CssBaseline,
    IconButton,
    List,
    ListItem,
    ListItemSecondaryAction,
    ListItemText,
    Paper,
    TextField,
    Toolbar,
    Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import LogoutIcon from "@mui/icons-material/Logout";
import AddIcon from "@mui/icons-material/Add";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";

const API_URL =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface Todo {
    id: string;
    name: string;
    completed: boolean;
}

export default function Dashboard() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [newTodo, setNewTodo] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchTodos();
    }, []);

    const getAuthHeaders = () => {
        const token = window.localStorage.getItem("token");
        return {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        };
    };

    const fetchTodos = async () => {
        try {
            const res = await fetch(`${API_URL}/todos`, {
                headers: getAuthHeaders(),
            });
            if (res.ok) {
                const data = await res.json();
                setTodos(data);
            } else if (res.status === 401) {
                window.location.href = "/";
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateTodo = async () => {
        if (!newTodo.trim()) return;

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/todos`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({ name: newTodo }),
            });
            if (res.ok) {
                setNewTodo("");
                fetchTodos();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleTodo = async (id: string, completed: boolean) => {
        try {
            await fetch(`${API_URL}/todos/${id}`, {
                method: "PATCH",
                headers: getAuthHeaders(),
                body: JSON.stringify({ completed: !completed }),
            });
            fetchTodos();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteTodo = async (id: string) => {
        try {
            await fetch(`${API_URL}/todos/${id}`, {
                method: "DELETE",
                headers: getAuthHeaders(),
            });
            fetchTodos();
        } catch (err) {
            console.error(err);
        }
    };

    const handleLogout = () => {
        window.localStorage.removeItem("token");
        window.localStorage.removeItem("user");
        window.location.href = "/";
    };

    return (
        <>
            <AppBar position="static">
                <Toolbar>
                    <Box display="flex" alignItems="center" sx={{ flexGrow: 1, gap: 1 }}>
                        <AssignmentIcon />
                        <Typography variant="h6" component="div">
                            Todo Dashboard
                        </Typography>
                    </Box>
                    <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout}>
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Box display="flex" gap={2} mb={4}>
                        <TextField
                            fullWidth
                            label="New Todo"
                            value={newTodo}
                            onChange={(e) => setNewTodo(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && handleCreateTodo()}
                            disabled={loading}
                        />
                        <Button
                            variant="contained"
                            size="large"
                            onClick={handleCreateTodo}
                            disabled={loading}
                            startIcon={<AddIcon />}
                        >
                            Add
                        </Button>
                    </Box>

                    <List>
                        {todos.map((todo) => (
                            <ListItem key={todo.id} divider>
                                <Checkbox
                                    edge="start"
                                    checked={todo.completed}
                                    onChange={() => handleToggleTodo(todo.id, todo.completed)}
                                />
                                <ListItemText
                                    primary={todo.name}
                                    sx={{
                                        textDecoration: todo.completed ? "line-through" : "none",
                                        color: todo.completed ? "text.secondary" : "text.primary",
                                    }}
                                />
                                <ListItemSecondaryAction>
                                    <IconButton
                                        edge="end"
                                        aria-label="delete"
                                        onClick={() => handleDeleteTodo(todo.id)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                        {todos.length === 0 && (
                            <Box display="flex" flexDirection="column" alignItems="center" py={4} color="text.secondary">
                                <PlaylistAddIcon sx={{ fontSize: 60, mb: 2, opacity: 0.5 }} />
                                <Typography variant="body1" align="center">
                                    No todos yet. Add one above!
                                </Typography>
                            </Box>
                        )}
                    </List>
                </Paper>
            </Container>
        </>
    );
}
