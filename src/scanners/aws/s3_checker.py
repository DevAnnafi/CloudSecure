import boto3
import json
from src.core.enums import Severity, CloudProvider, FindingType
from botocore.exceptions import ProfileNotFound

class S3Scanner:
    def __init__(self, access_key: str, secret_key: str, region: str, account_name: str):
        """Initialize S3 scanner with credentials"""
        self.account_name = account_name
        self.region = region
        self.findings = []  # ✅ INITIALIZE FINDINGS!
        
        # Create boto3 session with provided credentials
        self.session = boto3.Session(
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            region_name=region
        )
        
        self.s3_client = self.session.client('s3')
        
        # Get account ID
        try:
            sts_client = self.session.client('sts')
            self.account_id = sts_client.get_caller_identity()['Account']
        except Exception:
            self.account_id = "unknown"

    def scan_buckets(self):
        try:
            response = self.s3_client.list_buckets()
            buckets = response['Buckets']
            for bucket in buckets:
                bucket_name = bucket["Name"]
                self.check_public_access(bucket_name)
                self.check_acl(bucket_name)
                self.check_policy(bucket_name)
                self.check_encryption(bucket_name)
        except Exception as e:
            print(f"S3 scan error: {e}")

        return self.findings

    def check_public_access(self, bucket_name):
        try:
            response = self.s3_client.get_public_access_block(Bucket=bucket_name)
            config = response['PublicAccessBlockConfiguration']
            if not all([config['BlockPublicAcls'], 
                        config['IgnorePublicAcls'],
                        config['BlockPublicPolicy'],
                        config['RestrictPublicBuckets']]):
                self.findings.append({
                    "severity": Severity.CRITICAL.value,
                    "title": "S3 Bucket Not Protected",
                    "resource": bucket_name,
                    "cloud_provider": "AWS",              
                    "account_id": self.account_id,        
                    "account_name": self.account_name,    
                    "description": "Block Public Access settings are not fully enabled",
                    "resource_id": f"s3://{bucket_name}"
                })
        except Exception:
            # No public access block = public!
            self.findings.append({
                "severity": Severity.CRITICAL.value,
                "title": "S3 Bucket Not Protected",
                "resource": bucket_name,
                "cloud_provider": "AWS",              
                "account_id": self.account_id,        
                "account_name": self.account_name, 
                "description": "Block Public Access settings are not configured",
                "resource_id": f"s3://{bucket_name}"
            })

    def check_acl(self, bucket_name):
        try:
            response = self.s3_client.get_bucket_acl(Bucket=bucket_name)
            grants = response['Grants']

            for grant in grants:
                if 'URI' in grant.get('Grantee', {}):
                    uri = grant['Grantee']['URI']
                    if 'AllUsers' in uri or 'AuthenticatedUsers' in uri:
                        self.findings.append({
                            "severity": Severity.CRITICAL.value,
                            "title": "Public S3 Bucket via ACL",
                            "resource": bucket_name,
                            "cloud_provider": "AWS",              
                            "account_id": self.account_id,        
                            "account_name": self.account_name, 
                            "description": "Bucket ACL grants public access",
                            "resource_id": f"s3://{bucket_name}"
                        })
                        break
        except Exception as e:
            print(f"ACL check error for {bucket_name}: {e}")

    def check_policy(self, bucket_name):
        try:
            response = self.s3_client.get_bucket_policy(Bucket=bucket_name)
            policy = json.loads(response["Policy"])
            statements = policy["Statement"]
            for statement in statements:
                if statement["Effect"] == 'Allow' and (statement['Principal'] == '*' or statement['Principal'] == {'AWS': '*'}):
                    self.findings.append({
                        "severity": Severity.CRITICAL.value,
                        "title": "Public S3 Bucket via Policy",
                        "resource": bucket_name,
                        "cloud_provider": "AWS",              
                        "account_id": self.account_id,        
                        "account_name": self.account_name, 
                        "description": "Bucket policy grants public access",
                        "resource_id": f"s3://{bucket_name}"
                    })
                    break
        except Exception as e:
            # No policy is fine
            pass

    def check_encryption(self, bucket_name):
        try:
            self.s3_client.get_bucket_encryption(Bucket=bucket_name)
        except Exception:
            self.findings.append({
                "severity": Severity.HIGH.value,
                "title": "S3 Bucket Encryption Disabled",
                "resource": bucket_name,
                "cloud_provider": "AWS",              
                "account_id": self.account_id,        
                "account_name": self.account_name, 
                "description": "Bucket does not have default encryption enabled",
                "resource_id": f"s3://{bucket_name}"
            })