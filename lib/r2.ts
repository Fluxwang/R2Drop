import { S3Client } from "@aws-sdk/client-s3";
import { NodeHttpHandler } from "@smithy/node-http-handler";
import { HttpsProxyAgent } from "https-proxy-agent";

// 从环境变量中读取代理配置以及R2凭证
const proxyUrl =
  process.env.https_proxy || process.env.HTTPS_PROXY || process.env.HTTP_PROXY;

const R2_ENDPOINT = process.env.R2_ENDPOINT;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;

// 如果存在代理，创建代理agent
const proxyAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;

console.log("代理配置:", proxyUrl ? `使用代理${proxyUrl}` : "不使用代理");

// 验证环境变量是否存在
if (
  !R2_ENDPOINT ||
  !R2_ACCESS_KEY_ID ||
  !R2_SECRET_ACCESS_KEY ||
  !R2_BUCKET_NAME
) {
  throw new Error("R2 环境变量配置不当");
}

// 创建并配置 S3 客户端
const s3Client = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
  requestHandler: new NodeHttpHandler({
    httpAgent: proxyAgent,
    httpsAgent: proxyAgent,
    requestTimeout: 30000, //30秒超时
    connectionTimeout: 10000, //10秒连接超时
  }),
});

export { s3Client, R2_BUCKET_NAME };
