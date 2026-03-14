PROFILE=${1:-default}

echo "🧹 Cleaning up vulnerable AWS resources..."

# Get all test resources
BUCKETS=$(aws s3 ls --profile $PROFILE | grep "cloudsecure-test-" | awk '{print $3}')
USERS=$(aws iam list-users --profile $PROFILE --query 'Users[?starts_with(UserName, `cloudsecure-test-`)].UserName' --output text)

# Delete S3 buckets
for bucket in $BUCKETS; do
  echo "Deleting bucket: $bucket"
  aws s3 rb s3://$bucket --force --profile $PROFILE 2>/dev/null
done

# Delete IAM users
for user in $USERS; do
  echo "Deleting user: $user"
  
  # Delete login profile
  aws iam delete-login-profile --user-name $user --profile $PROFILE 2>/dev/null
  
  # Delete access keys
  KEYS=$(aws iam list-access-keys --user-name $user --profile $PROFILE --query 'AccessKeyMetadata[].AccessKeyId' --output text)
  for key in $KEYS; do
    aws iam delete-access-key --user-name $user --access-key-id $key --profile $PROFILE
  done
  
  # Detach policies
  POLICIES=$(aws iam list-attached-user-policies --user-name $user --profile $PROFILE --query 'AttachedPolicies[].PolicyArn' --output text)
  for policy in $POLICIES; do
    aws iam detach-user-policy --user-name $user --policy-arn $policy --profile $PROFILE
  done
  
  # Delete user
  aws iam delete-user --user-name $user --profile $PROFILE
done

echo "✅ Cleanup complete!"