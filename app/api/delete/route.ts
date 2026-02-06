import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { s3Client, R2_BUCKET_NAME } from "@/lib/r2";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "未授权，请先登录" }, { status: 401 });
    }

    const { key } = await request.json();
    if (!key) {
      return NextResponse.json({ error: "缺少文件key" }, { status: 400 });
    }
    const userPrefix = `uploads/${session.user?.email}/`;
    if (!key.startsWith(userPrefix)) {
      return NextResponse.json({ error: "禁止访问" }, { status: 403 });
    }

    const command = new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);

    return NextResponse.json({ message: "删除成功" }, { status: 200 });
  } catch (error: unknown) {
    console.error("删除文件失败", error);
    return NextResponse.json(
      {
        error: "删除文件失败",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
