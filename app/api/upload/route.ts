import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const form = await req.formData();
  const botLogoFile = form.get("botLogo") as File;
  const qrCodeFile = form.get("qrCode") as File;

  if (!botLogoFile || !qrCodeFile) {
    return NextResponse.json(
      { error: "Both botLogo and qrCode files are required" },
      { status: 400 }
    );
  }

  let botLogoUrl: string | null = null;
  if (botLogoFile) {
    const fileExtension = botLogoFile.name.split(".").pop();
    const fileName = `botlogo/${
      botLogoFile.name
    }-${Date.now()}.${fileExtension}`;
    const botLogoBlob = await put(fileName, botLogoFile, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: true,
    });
    botLogoUrl = botLogoBlob.url;
  }

  let qrCodeUrl: string | null = null;
  if (qrCodeFile) {
    const fileExtension = qrCodeFile.name.split(".").pop();
    const fileName = `qrcode/${
      qrCodeFile.name
    }-${Date.now()}.${fileExtension}`;
    const qrCodeBlob = await put(fileName, qrCodeFile, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: true,
    });
    qrCodeUrl = qrCodeBlob.url;
  }

  return NextResponse.json({
    botLogoUrl,
    qrCodeUrl,
  });
}
