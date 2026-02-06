import { NextResponse } from "next/server";
import { getServerSession } from "next-auth"; // 用于获取用户会话
import { authOptions } from "../auth/[...nextauth]/route";
import { PutObjectCommand } from "@aws-sdk/client-s3"; // 用于上传文件到S3
import { s3Client, R2_BUCKET_NAME } from "@/lib/r2";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"; // 获取预签名URL
import { randomUUID } from "crypto"; // 用于生成唯一文件名

export async function POST(request: Request) {
  try {
    // 通过seession 验证是否登录
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "未授权，请先登录" }, { status: 401 });
    }
    // 从客户端获取用户名和文件类型
    const body = await request.json();
    const { filename, contentType } = body;

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: "无法获取文件名或文件类型" },
        { status: 400 }
      );
    }
    // 生成一个唯一的S3存储键(key)
    const uniqueKey = `uploads/${
      session.user.email
    }/${randomUUID()}/${filename}`;

    // 创建 PutObjectCommand
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: uniqueKey,
      ContentType: contentType,
    });

    // 生成预签名URL
    // 这个URL 默认有效期为 3600 秒
    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

    // 将URL和这个文件的唯一键返回给客户端
    // 客户端需要URL来上传，我们未来需要key 来下载和删除
    return NextResponse.json(
      {
        url: uploadUrl,
        key: uniqueKey,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("获取预签名URL失败", error);
    return NextResponse.json({ error: "服务器内部错误." }, { status: 500 });
  }
}
