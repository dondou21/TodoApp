"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type AuthMode = "login" | "register";

interface User {
  id: string;
  email: string;
  name: string;
}

interface LoginResponse {
  accessToken: string;
  user: User;
}

interface RegisterResponse {
  user: User;
}


export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = window.localStorage.getItem("token");
    const storedUser = window.localStorage.getItem("user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const handleModeChange = (_: unknown, value: AuthMode) => {
    setMode(value);
    setError(null);
    setSuccess(null);
  };

  const handleRegister = async () => {
    setError(null);
    setSuccess(null);

    if (!email || !name || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, name, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message ?? "Registration failed.");
        return;
      }

      const data: RegisterResponse = await res.json();
      setSuccess("Registration successful. You can now log in.");
      setMode("login");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      setError("Network error during registration.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setError(null);
    setSuccess(null);

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message ?? "Login failed.");
        return;
      }

      const data: LoginResponse = await res.json();
      setToken(data.accessToken);
      setUser(data.user);
      window.localStorage.setItem("token", data.accessToken);
      window.localStorage.setItem("user", JSON.stringify(data.user));
      setSuccess("Logged in successfully.");
      window.location.href = "/dashboard";
    } catch (err) {
      console.error(err);
      setError("Network error during login.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      try {
        await fetch(`${API_URL}/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
      } catch {
        // Ignore logout network errors; we'll still clear local state.
      }

      setToken(null);
      setUser(null);
      window.localStorage.removeItem("token");
      window.localStorage.removeItem("user");
      setSuccess("Logged out.");
    } finally {
      setLoading(false);
    }
  };

  const isLoggedIn = !!token && !!user;

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Paper elevation={3} sx={{ p: 4, width: "100%" }}>
        <Box mb={3} textAlign="center">
          <Typography variant="h4" component="h1" gutterBottom>
            Todo App Auth
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Register or log in to manage your todos.
          </Typography>
        </Box>

        <Tabs
          value={mode}
          onChange={handleModeChange}
          centered
          sx={{ mb: 3 }}
        >
          <Tab label="Login" value="login" />
          <Tab label="Register" value="register" />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {isLoggedIn ? (
          <Box>
            <Typography variant="h6" gutterBottom>
              Welcome, {user.name}!
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              You are authenticated. Store this token securely and send it as
              a Bearer token in the Authorization header when calling
              protected backend endpoints.
            </Typography>
            <Box
              component="pre"
              sx={{
                bgcolor: "grey.100",
                p: 2,
                borderRadius: 1,
                fontSize: 12,
                overflowX: "auto",
                mb: 2,
              }}
            >
              {token}
            </Box>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleLogout}
              disabled={loading}
            >
              Logout
            </Button>
          </Box>
        ) : (
          <Box component="form" noValidate autoComplete="off">
            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {mode === "register" && (
              <TextField
                label="Name"
                fullWidth
                margin="normal"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}
            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {mode === "register" && (
              <TextField
                label="Confirm Password"
                type="password"
                fullWidth
                margin="normal"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            )}

            <Button
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3 }}
              disabled={loading}
              onClick={mode === "login" ? handleLogin : handleRegister}
            >
              {mode === "login" ? "Login" : "Register"}
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
}
