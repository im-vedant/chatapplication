import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client, BUCKET_NAME } from "@/lib/minio-client";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const fileName = searchParams.get("filename");
    const contentType = searchParams.get("contentType");

    if (!fileName || !contentType) {
        return NextResponse.json({ error: "Missing filename or contentType" }, { status: 400 });
    }

    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileName,
        ContentType: contentType,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });

    return NextResponse.json({ url: signedUrl });
}
