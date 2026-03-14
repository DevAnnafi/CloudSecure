# AWS Profile and Region
PROFILE=${1:-default}
REGION=${2:-us-east-1}

echo "🔴 Creating VULNERABLE AWS resources for testing..."
echo "Profile: $PROFILE"
echo "Region: $REGION"
echo ""

# Get Account ID
ACCOUNT_ID=$(aws sts get-caller-identity --profile $PROFILE --query Account --output text)
echo "Account ID: $ACCOUNT_ID"
echo ""

# ==========================================
# 1. PUBLIC S3 BUCKET (CRITICAL)
# ==========================================
echo "1️⃣  Creating PUBLIC S3 bucket..."
BUCKET_PUBLIC="cloudsecure-test-public-$(date +%s)"

aws s3 mb s3://$BUCKET_PUBLIC --profile $PROFILE --region $REGION

# Disable block public access
aws s3api put-public-access-block \
  --bucket $BUCKET_PUBLIC \
  --public-access-block-configuration \
    "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false" \
  --profile $PROFILE

# Add public read policy
aws s3api put-bucket-policy \
  --bucket $BUCKET_PUBLIC \
  --policy "{
    \"Version\": \"2012-10-17\",
    \"Statement\": [{
      \"Sid\": \"PublicRead\",
      \"Effect\": \"Allow\",
      \"Principal\": \"*\",
      \"Action\": \"s3:GetObject\",
      \"Resource\": \"arn:aws:s3:::$BUCKET_PUBLIC/*\"
    }]
  }" \
  --profile $PROFILE

echo "✅ Created: $BUCKET_PUBLIC (PUBLIC ACCESS)"

# ==========================================
# 2. UNENCRYPTED S3 BUCKET (HIGH)
# ==========================================
echo ""
echo "2️⃣  Creating UNENCRYPTED S3 bucket..."
BUCKET_UNENC="cloudsecure-test-unencrypted-$(date +%s)"

aws s3 mb s3://$BUCKET_UNENC --profile $PROFILE --region $REGION

echo "✅ Created: $BUCKET_UNENC (NO ENCRYPTION)"

# ==========================================
# 3. S3 BUCKET WITHOUT VERSIONING (MEDIUM)
# ==========================================
echo ""
echo "3️⃣  Bucket without versioning already created (both above)"

# ==========================================
# 4. IAM USER WITHOUT MFA (HIGH)
# ==========================================
echo ""
echo "4️⃣  Creating IAM user WITHOUT MFA..."
USER_NO_MFA="cloudsecure-test-no-mfa"

aws iam create-user --user-name $USER_NO_MFA --profile $PROFILE 2>/dev/null || echo "User may already exist"

# Create console password (triggers MFA check)
aws iam create-login-profile \
  --user-name $USER_NO_MFA \
  --password 'TestPassword123' \
  --password-reset-required \
  --profile $PROFILE 2>/dev/null || echo "Login profile may already exist"

echo "✅ Created: $USER_NO_MFA (NO MFA)"

# ==========================================
# 5. IAM USER WITH ADMIN ACCESS (CRITICAL)
# ==========================================
echo ""
echo "5️⃣  Creating IAM user with ADMIN access..."
USER_ADMIN="cloudsecure-test-admin"

aws iam create-user --user-name $USER_ADMIN --profile $PROFILE 2>/dev/null || echo "User may already exist"

aws iam attach-user-policy \
  --user-name $USER_ADMIN \
  --policy-arn arn:aws:iam::aws:policy/AdministratorAccess \
  --profile $PROFILE

echo "✅ Created: $USER_ADMIN (ADMINISTRATOR ACCESS)"

# ==========================================
# 6. IAM USER WITH OLD ACCESS KEYS (HIGH)
# ==========================================
echo ""
echo "6️⃣  Creating IAM user with access keys (will be old after 90 days)..."
USER_OLD_KEYS="cloudsecure-test-old-keys"

aws iam create-user --user-name $USER_OLD_KEYS --profile $PROFILE 2>/dev/null || echo "User may already exist"

# Create access keys
aws iam create-access-key --user-name $USER_OLD_KEYS --profile $PROFILE 2>/dev/null || echo "Keys may already exist"

echo "✅ Created: $USER_OLD_KEYS (ACCESS KEYS - will need rotation in 90 days)"

# ==========================================
# SUMMARY
# ==========================================
echo ""
echo "🎉 VULNERABLE RESOURCES CREATED!"
echo ""
echo "📊 Expected Findings:"
echo "  🔴 CRITICAL:"
echo "    - Public S3 bucket: $BUCKET_PUBLIC"
echo "    - IAM user with Admin access: $USER_ADMIN"
echo "  🟠 HIGH:"
echo "    - Unencrypted S3 bucket: $BUCKET_UNENC"
echo "    - IAM user without MFA: $USER_NO_MFA"
echo "  🟡 MEDIUM/LOW:"
echo "    - S3 buckets without versioning"
echo "    - IAM access keys (will be flagged after 90 days)"
echo ""
echo "🚀 Now run a scan in CloudSecure!"
echo ""
echo "🧹 To cleanup later, run: ./cleanup-aws-vulns.sh $PROFILE"