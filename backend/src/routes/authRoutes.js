import { Router } from "express";
import {
  login,
  me,
  register,
  logout,
  googleLogin,
  changePassword // Dodajemy funkcję zmiany hasła do importu
} from "../controllers/authController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
// Trasa logowania przez Google
router.post("/google", googleLogin);

// NOWA TRASA: Zmiana hasła (wymaga bycia zalogowanym - requireAuth)
router.post("/change-password", requireAuth, changePassword);

// Trasa do pobierania danych o aktualnym użytkowniku
router.get("/me", requireAuth, me);

export default router;
