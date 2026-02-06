import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { s3Client, R2_BUCKET_NAME } from "@/lib/r2";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";

export async function POST(request: Request) {
  try {
    // 检查是否认证
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      console.error("未授权，请先登录");
      return NextResponse.json({ error: "未授权，请先登录" }, { status: 401 });
    }
    // 通过key 去确定是否有文件
    // key=`uploads/${session.user.email}/${randomUUID()}/${filename}`;
    const { key } = await request.json();
    if (!key) {
      return NextResponse.json({ error: "缺少文件 key" }, { status: 400 });
    }

    // 安全检查: 确保用户只能下载自己目录下的文件
    const userPrefix = `uploads/${session.user.email}/`;
    if (!key.startsWith(userPrefix)) {
      return NextResponse.json({ error: "禁止访问" }, { status: 403 });
    }

    // 提取文件名
    const filename = key.split("/").pop();

    // 创建 GetObjectCommond
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      // 强制浏览器下载
      ResponseContentDisposition: `attachment; filename="${filename}"`,
    });

    // 生成临时的预签名URL
    const downloadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 900,
    });

    // 将URL 返回给前端
    return NextResponse.json({ url: downloadUrl }, { status: 200 });
  } catch (error: unknown) {
    console.error("获取下载链接失败", error);
    return NextResponse.json(
      {
        error: "服务器内部错误",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
