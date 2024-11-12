import { createHash, createHmac } from "crypto";
import { IncomingHttpHeaders } from "http";

export const checkSignature = (
  token: string,
  requestBody: any,
  requestHeaders: IncomingHttpHeaders
) => {
  const signature = requestHeaders["crypto-pay-api-signature"];
  if (!signature || signature === "") {
    return false;
  }
  const secret = createHash("sha256").update(token).digest();
  const checkString = JSON.stringify(requestBody);
  const hmac = createHmac("sha256", secret).update(checkString).digest("hex");
  return hmac === signature;
};
