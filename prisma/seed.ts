import "dotenv/config";
import { hashPassword } from "../lib/auth/password";
import { prisma } from "../db/prisma";

async function main() {
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;

  const count = await prisma.user.count();
  if (count > 0) {
    console.log("Seed: já existem usuários, nada a fazer.");
    return;
  }

  if (!email || !password) {
    console.log(
      "Seed: defina BOOTSTRAP_ADMIN_EMAIL e BOOTSTRAP_ADMIN_PASSWORD para criar o primeiro admin, ou use POST /api/auth/bootstrap.",
    );
    return;
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: "ADMIN",
    },
  });

  const orphan = await prisma.device.updateMany({
    where: { userId: null },
    data: { userId: user.id },
  });

  console.log(
    `Seed: administrador criado (${user.email}). Dispositivos sem dono atualizados: ${orphan.count}.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
