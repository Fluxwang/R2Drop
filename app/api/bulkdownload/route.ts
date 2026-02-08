import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { s3Client, R2_BUCKET_NAME } from "@/lib/r2";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "未授权，请先登录" }, { status: 401 });
    }

    const { keys } = await request.json();
    if (!keys || !Array.isArray(keys) || keys.length === 0) {
      return NextResponse.json({ error: "缺少文件列表" }, { status: 400 });
    }

    const userPrefix = `uploads/${session.user.email}/`;

    // 验证所有文件都属于当前用户
    for (const key of keys) {
      if (!key.startsWith(userPrefix)) {
        return NextResponse.json({ error: "禁止访问" }, { status: 403 });
      }
    }

    // 为每个文件生成下载URL
    const downloadUrls = await Promise.all(
      keys.map(async (key) => {
        const filename = key.split("/").pop();
        const command = new GetObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: key,
          ResponseContentDisposition: `attachment; filename="${filename}"`,
        });
        const url = await getSignedUrl(s3Client, command, { expiresIn: 900 });
        return { key, filename, url };
      })
    );

    return NextResponse.json({ downloads: downloadUrls }, { status: 200 });
  } catch (error: unknown) {
    console.error("批量下载失败", error);
    return NextResponse.json(
      {
        error: "服务器内部错误",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
