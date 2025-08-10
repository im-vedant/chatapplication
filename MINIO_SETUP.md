# MinIO Setup with Docker

This guide will help you set up a local MinIO server using Docker for development and testing file uploads.

## Prerequisites
- [Docker](https://docs.docker.com/get-docker/) installed on your machine

## 1. Start MinIO Server with Docker

Run the following command in your terminal:

```
docker run -d \
  --name minio \
  -p 9000:9000 \
  -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  quay.io/minio/minio server /data --console-address ":9001"
```

- This will start MinIO on:
  - S3 API: http://localhost:9000
  - Admin Console: http://localhost:9001
- Default credentials:
  - **Username:** `minioadmin`
  - **Password:** `minioadmin`

## 2. Access MinIO Console

Open [http://localhost:9001](http://localhost:9001) in your browser and log in with the credentials above.


## 3. Create a Bucket
- After logging in, click **"Buckets"** in the sidebar.
- Click **"Create Bucket"** and give it a name (e.g., `uploads`).

**Important:**
- You must set the same bucket name in your app's environment variables as `MINIO_BUCKET`.
- Example: If you create a bucket called `uploads`, set `MINIO_BUCKET=uploads` in your `.env` file.

## 4. Configure Your App
- Use the following environment variables in your app:
  - `MINIO_ENDPOINT=http://localhost:9000`
  - `MINIO_ACCESS_KEY=minioadmin`
  - `MINIO_SECRET_KEY=minioadmin`
  - `MINIO_BUCKET=uploads` (or your chosen bucket name)

## 5. Stopping/Removing MinIO
- To stop: `docker stop minio`
- To remove: `docker rm minio`

---
For more details, see the [MinIO documentation](https://min.io/docs/minio/linux/index.html).
