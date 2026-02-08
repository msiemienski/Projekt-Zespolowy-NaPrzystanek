import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "./src/models/User.js";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/naprzystanek";

async function createAdmin() {
  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.error("Użycie: node backend/createAdmin.js <email> <hasło> <nazwa>");
    process.exit(1);
  }

  const [email, password, name] = args;

  try {
    await mongoose.connect(MONGO_URI);
    console.log("Połączono z MongoDB.");

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`Użytkownik ${email} już istnieje. Aktualizuję rolę na 'admin'.`);
      existingUser.role = "admin";
      await existingUser.save();
      console.log("Rola zaktualizowana pomyślnie.");
    } else {
      console.log(`Tworzę nowe konto administratora: ${email}`);
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      await User.create({
        email,
        passwordHash,
        name,
        role: "admin"
      });
      console.log("Konto administratora utworzone pomyślnie.");
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error("Błąd:", error);
    process.exit(1);
  }
}

createAdmin();
