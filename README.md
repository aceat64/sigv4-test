👋I am looking for a long-term partner.  🌍I was previously working in Japan as a software engineer and AI trainer, but I have recently lost my position—a situation that would be too lengthy to explain in detail here.  Moving forward, I intend to pursue global-facing roles and continue with AI training.  ✅✅As you may know, budgets in Japan are quite limited; even if one secures a position with a global company, the expected monthly compensation is typically only around $2,000–$3,000.  Furthermor
# AWS SigV4 Testing & Examples

Easily authenticate a request and the requestor's AWS IAM Principal.

Some examples of IAM Prinipals:

- IAM user
- IAM assumed role
- AWS Lambda execution role
- EC2 instance profile
- Kubernetes service account in EKS (using [IRSA](https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html))

The only requirement on the client-side is access to AWS IAM credentials, using any of the [credential providers](https://docs.aws.amazon.com/sdkref/latest/guide/standardized-credentials.html) supported by the AWS SDK.

## How It Works

1. The client creates a pre-signed `GetCallerIdentity` request. See the [`signGetCallerIdentity()`](src/index.ts) function for an example of how to do this in TypeScript/NodeJS.

    Signed request example:

    ```json
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
    ```

2. The client sends the pre-signed `GetCallerIdentity` request to your server/service. It can be sent in any format such as the JSON object above or assembled into a URL (example [`buildUrl()`](src/index.ts))
3. The server calls AWS STS with the pre-signed request to get the IAM Principal.

    Example response:

    ```json
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
    ```

IMPORTANT: When the server calls AWS STS it must be done over HTTPS and care should be taken to ensure that the hostname is `sts.amazonaws.com`. Do not trust the `hostname` in the pre-signed request sent by the client!

## References

- [AWS Signature v4 algorithm](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_sigv-create-signed-request.html)
- <https://docs.aws.amazon.com/sdkref/latest/guide/standardized-credentials.html>
- <https://developer.hashicorp.com/vault/docs/auth/aws#iam-auth-method>
- <https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html>
