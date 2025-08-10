import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
    region: "us-east-1",
    endpoint: "http://localhost:9000",
    forcePathStyle: true,
    credentials: {
        accessKeyId: "minioadmin",
        secretAccessKey: "minioadmin",
    },
});

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const fileName = searchParams.get("filename");
    const contentType = searchParams.get("contentType");

    if (!fileName || !contentType) {
        return NextResponse.json({ error: "Missing filename or contentType" }, { status: 400 });
    }


    const bucket = process.env.MINIO_BUCKET || "uploads";
    const command = new PutObjectCommand({
        Bucket: bucket,
        Key: fileName,
        ContentType: contentType,
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

    return NextResponse.json({ url: signedUrl });
}
