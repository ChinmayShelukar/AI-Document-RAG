import {
  Box,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
  Snackbar,
  Alert,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useState } from "react";
import { api } from "../../shared/services/api/config/axios.config";
import { useNavigate } from "react-router-dom";

const schema = yup
  .object({
    name: yup.string().required("Name is required"),
    email: yup.string().email("Invalid email").required("Email is required"),
    password: yup
      .string()
      .min(8, "Password must be at least 8 characters")
      .required("Password is required"),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password")], "Passwords do not match")
      .required("Password confirmation is required"),
  })
  .required();

type FormData = yup.InferType<typeof schema>;

export const Register = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // Snackbar message
  const [openSnackbar, setOpenSnackbar] = useState(false); // Snackbar control

  const navigate = useNavigate();
  const theme = useTheme();
  const isMdDown = useMediaQuery(theme.breakpoints.down("md"));

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const response = await api.post("/auth/register", data);
      if (response.status === 200) {
        navigate("/chat");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      // Get the error message, if any
      const msg =
        error.response?.data?.message ||
        "An error occurred during registration. Please try again.";
      setErrorMessage(msg);
      setOpenSnackbar(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Grid container sx={{ height: "100%" }}>
        {/* Left column (Form) */}
        <Grid
          size={{ xs: 12, md: 8 }}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            p: 4,
          }}
        >
          <Paper
            elevation={isMdDown ? 0 : 3}
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              maxWidth: 500,
              height: 600,
              p: isMdDown ? 1 : 4,
              justifyContent: "center",
              borderRadius: 3,
              bgcolor: isMdDown ? "transparent" : undefined,
              boxShadow: isMdDown ? "none" : undefined,
            }}
          >
            <Typography variant="h5" align="center" gutterBottom>
              Create your account!
            </Typography>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <TextField
                fullWidth
                label="Name"
                {...register("name")}
                margin="normal"
                error={!!errors.name}
                helperText={errors.name?.message}
              />

              <TextField
                fullWidth
                label="Email"
                type="email"
                {...register("email")}
                margin="normal"
                error={!!errors.email}
                helperText={errors.email?.message}
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? "text" : "password"}
                {...register("password")}
                margin="normal"
                error={!!errors.password}
                helperText={errors.password?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((prev) => !prev)}
                        edge="end"
                        sx={{ mr: 0 }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Confirm Password"
                type={showConfirm ? "text" : "password"}
                {...register("confirmPassword")}
                margin="normal"
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirm((prev) => !prev)}
                        edge="end"
                        sx={{ mr: 0 }}
                      >
                        {showConfirm ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{ mt: 3, pt: 1.5 }}
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Sign up"}
              </Button>
            </form>

            <Box mt={2}>
              <Typography>
                Already have an account?{" "}
                <Link href="/" underline="hover">
                  Click here
                </Link>
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Right column (Illustration) */}
        {!isMdDown && (
          <Grid
            size={{ xs: 12, md: 4 }}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "primary.main",
              color: "#fff",
              p: 4,
            }}
          >
            <Box textAlign="center">
              <Box
                sx={{
                  bgcolor: "#fff",
                  color: "primary.main",
                  width: 55,
                  height: 55,
                  borderRadius: "12px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontWeight: "bold",
                  fontSize: 30,
                  userSelect: "none",
                  mx: "auto",
                  mb: 2,
                }}
              >
                AI
              </Box>
              <Typography variant="h4" fontWeight="bold">
                Check Docs
              </Typography>
              <Typography variant="subtitle1" mt={1}>
                Sign up and harness the power of AI for your documents.
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* Error snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="error"
          sx={{ width: "100%" }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};
