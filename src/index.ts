import { fromNodeProviderChain } from "@aws-sdk/credential-providers";
import { SignatureV4 } from "@smithy/signature-v4";
import { HttpRequest } from "@smithy/types";
import { Sha256 } from "@aws-crypto/sha256-js";

import queryString from "query-string";

const credentialProvider = fromNodeProviderChain();
const awsRegion = process.env.AWS_REGION ?? "us-east-1";

async function signGetCallerIdentity(ttl = 60): Promise<HttpRequest> {
  const signer = new SignatureV4({
    credentials: credentialProvider,
    service: "sts",
    region: awsRegion,
    sha256: Sha256,
  });

  const request: HttpRequest = {
    method: "GET",
    protocol: "https:",
    hostname: "sts.amazonaws.com",
    path: "/",
    headers: {
      Host: "sts.amazonaws.com",
    },
    query: {
      Action: "GetCallerIdentity",
      Version: "2011-06-15",
    },
  };

  return await signer.presign(request, { expiresIn: ttl });
}

function buildUrl(request: HttpRequest): string {
  return `${request.protocol}//${request.hostname}${
    request.path
  }?${queryString.stringify(request.query!)}`;
}

signGetCallerIdentity().then((request) => {
  console.log(JSON.stringify(request));
  console.log(`curl -H "Accept: application/json" "${buildUrl(request)}"`);
});

/*
Example Request - signGetCallerIdentity()
{
  "method": "GET",
  "hostname": "sts.amazonaws.com",
  "query": {
    "Action": "GetCallerIdentity",
    "Version": "2011-06-15",
    "X-Amz-Security-Token": "__REDACTED__",
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": "__REDACTED__/20250610/us-east-1/sts/aws4_request",
    "X-Amz-Date": "20250610T222745Z",
    "X-Amz-Expires": "60",
    "X-Amz-SignedHeaders": "host",
    "X-Amz-Signature": "06b0c9ebdec42e4be5cd12037dc43d3132c1f2cb3edafb77a5f6b468ac3662fa"
  },
  "headers": {
    "Host": "sts.amazonaws.com"
  },
  "protocol": "https:",
  "path": "/"
}


Example Response
{
  "GetCallerIdentityResponse": {
    "GetCallerIdentityResult": {
      "Account": "280993154261",
      "Arn": "arn:aws:sts::280993154261:assumed-role/AWSReservedSSO_ViewOnlyAccess_e7787a2c4e54b8ca/andrew.lecody@p0.dev",
      "UserId": "AROAUC3D7ITK4CUOCFWSJ:andrew.lecody@p0.dev"
    },
    "ResponseMetadata": {
      "RequestId": "56623135-0260-4863-8f2d-fb9faff1e92d"
    }
  }
}

*/
