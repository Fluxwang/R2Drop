// src/app/api/register/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // 接收前端传来的参数
    const { email, password, confirmPassword } = body;

    const normalizedEmail =
      // trim() 移除字符串两边的空格并且返回个新的字符串
      typeof email === "string" ? email.trim().toLowerCase() : "";

    const plainPassword = typeof password === "string" ? password : "";
    const plainConfirmPassword =
      typeof confirmPassword === "string" ? confirmPassword : "";

    if (!normalizedEmail || !plainPassword || !plainConfirmPassword) {
      return NextResponse.json(
        { message: "Email, password, and confirm password are required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // 将normalizedEmail 和 emailregex 进行比对
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { message: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    if (plainPassword.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    if (plainPassword !== plainConfirmPassword) {
      return NextResponse.json(
        { message: "Passwords do not match" },
        { status: 400 }
      );
    }
    // 1. 检查用户是否已存在
    // 其中的 prisma.user 指的是在 schema.prisma 中定义的model，也就是名为User的model
    // https://www.prisma.io/docs/orm/prisma-client/queries/crud
    const existingUser = await prisma.user.findUnique({
      // 在User表中查找一条基于"唯一"字段匹配的记录，传入的 where 必须使用一个或多个被定义为唯一的字段
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email already in use" },
        { status: 400 }
      );
    }

    // 2. 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. 创建新用户
    const newUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      { user: newUser.email, message: "User created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/register error:", error);
    return NextResponse.json(
      { message: (error as Error)?.message ?? "Something went wrong" },
      { status: 500 }
    );
  }
}
