import { prisma } from "@/lib/prisma";
import { Prisma, Role } from "@prisma/client";

export const userRepository = {
  async createUser(data: Prisma.UserCreateInput) {
    return await prisma.user.create({ data });
  },

  async updateUser(userId: string, data: Prisma.UserUpdateInput) {
    return await prisma.user.update({
      where: { id: userId },
      data,
    });
  },

  async findByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { collegeEmail: email },
    });
  },

  async findByVerificationToken(token: string) {
    return await prisma.user.findUnique({
      where: { verificationToken: token },
    });
  },

  async markEmailVerified(userId: string) {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        emailVerified: true,
        verificationToken: null,
      },
    });
  },

  async updateRole(userId: string, role: Role) {
    return await prisma.user.update({
      where: { id: userId },
      data: { role },
    });
  },

  async findStudentsGraduatedBeforeOrIn(year: number) {
    return await prisma.user.findMany({
      where: {
        role: "STUDENT",
        graduationYear: { lte: year },
      },
    });
  },
};
