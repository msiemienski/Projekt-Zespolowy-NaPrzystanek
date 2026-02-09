import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { User } from "../models/User.js";

const COOKIE_NAME = "token";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function setAuthCookie(res, userId) {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("Brak JWT_SECRET w zmiennych środowiskowych");
  }

  const token = jwt.sign({ sub: userId }, jwtSecret, {
    expiresIn: "7d"
  });

  const isProduction = process.env.NODE_ENV === "production";

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: isProduction ? "strict" : "lax",
    secure: isProduction,
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

// - min. 8 znaków
// - przynajmniej 1 wielka litera
// - przynajmniej 1 znak specjalny
function validatePassword(password) {
  if (!password || typeof password !== "string") {
    return "Hasło jest wymagane.";
  }
  if (password.length < 8) {
    return "Hasło musi mieć co najmniej 8 znaków.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Hasło musi zawierać co najmniej jedną wielką literę.";
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return "Hasło musi zawierać co najmniej jeden znak specjalny.";
  }
  return null;
}

export async function register(req, res) {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: "Brak wymaganych pól" });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Użytkownik już istnieje" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      email,
      passwordHash,
      name
    });

    setAuthCookie(res, user._id.toString());

    return res.status(201).json({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role
    });
  } catch (error) {
    console.error("Błąd rejestracji:", error);
    return res.status(500).json({ message: "Błąd serwera" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Brak wymaganych pól" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Nieprawidłowe dane logowania" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Nieprawidłowe dane logowania" });
    }

    setAuthCookie(res, user._id.toString());

    return res.status(200).json({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role
    });
  } catch (error) {
    console.error("Błąd logowania:", error);
    return res.status(500).json({ message: "Błąd serwera" });
  }
}

// Funkcja obsługująca zmianę hasła przez zalogowanego użytkownika
export async function changePassword(req, res) {
  try {
    // 1. Pobieramy dane z żądania (body) oraz ID użytkownika z tokena (req.userId)
    const { currentPassword, newPassword } = req.body;
    const userId = req.userId;

    // 2. Sprawdzamy, czy przesłano oba hasła
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Musisz podać obecne i nowe hasło." });
    }

    // 3. Szukamy użytkownika w bazie danych po jego ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Nie znaleziono użytkownika." });
    }

    // 4. Sprawdzamy, czy podane obecne hasło zgadza się z tym zapisanym w bazie (używamy bcrypt)
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Podane obecne hasło jest błędne." });
    }

    // 5. Walidujemy nowe hasło (musi spełniać wymogi: min. 8 znaków, duża litera itp.)
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    // 6. Generujemy nowe "solenie" i hashujemy nowe hasło
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    // 7. Aktualizujemy hash w obiekcie użytkownika i zapisujemy w bazie
    user.passwordHash = newHash;
    await user.save();

    // 8. Zwracamy odpowiedź o sukcesie
    return res.status(200).json({ message: "Hasło zostało pomyślnie zmienione." });

  } catch (error) {
    console.error("Błąd podczas zmiany hasła:", error);
    return res.status(500).json({ message: "Wystąpił błąd serwera podczas zmiany hasła." });
  }
}

export async function me(req, res) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Brak autoryzacji" });
    }

    const user = await User.findById(userId).select("id email name role discountType");
    if (!user) {
      return res.status(404).json({ message: "Użytkownik nie istnieje" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Błąd pobierania profilu:", error);
    return res.status(500).json({ message: "Błąd serwera" });
  }
}

export async function logout(req, res) {
  res.clearCookie(COOKIE_NAME);
  return res.status(200).json({ message: "Wylogowano" });
}

export async function googleLogin(req, res) {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: "Brak tokena Google" });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res
        .status(500)
        .json({ message: "Brak GOOGLE_CLIENT_ID po stronie serwera" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const email = payload.email;
    const name =
      payload.name ||
      payload.given_name ||
      payload.family_name ||
      "Użytkownik Google";

    if (!email) {
      return res
        .status(400)
        .json({ message: "Brak emaila w danych konta Google" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      // dla kont Google generujemy losowe, zahashowane hasło (nie będzie używane do logowania ręcznego)
      const randomPassword =
        Math.random().toString(36) + Date.now().toString(36);
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(randomPassword, salt);

      user = await User.create({
        email,
        name,
        passwordHash
      });
    }

    setAuthCookie(res, user._id.toString());

    return res.status(200).json({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      discountType: user.discountType
    });
  } catch (error) {
    console.error("Błąd logowania przez Google:", error);
    return res
      .status(401)
      .json({ message: "Nie udało się zalogować przez Google" });
  }
}

// Funkcja do aktualizacji preferencji użytkownika (np. ulgi)
export async function updatePreferences(req, res) {
  try {
    const userId = req.userId;
    const { discountType } = req.body;

    if (!discountType) {
      return res.status(400).json({ message: "Brak typu ulgi w żądaniu" });
    }

    const availableDiscounts = ["normal", "reduced", "senior_student"];
    if (!availableDiscounts.includes(discountType)) {
      return res.status(400).json({ message: "Nieprawidłowy typ ulgi" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { discountType },
      { new: true }
    ).select("id email name role discountType");

    if (!user) {
      return res.status(404).json({ message: "Użytkownik nie istnieje" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Błąd aktualizacji preferencji:", error);
    return res.status(500).json({ message: "Błąd serwera podczas zapisywania preferencji" });
  }
}
