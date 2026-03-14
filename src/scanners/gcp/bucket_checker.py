from google.cloud import storage
from google.oauth2 import service_account
from core.enums import CloudProvider, Severity, FindingType
import json

class BucketScanner():
    def __init__(self, service_account_json=None, project_id=None, account_name=None):
        self.findings = []
        self.project_id = project_id
        self.account_name = account_name or "Default"
        
        # Parse service account JSON and create credentials
        if service_account_json and service_account_json.strip():  # Check not None and not empty
            try:
                sa_dict = json.loads(service_account_json)
                credentials = service_account.Credentials.from_service_account_info(sa_dict)
                self.storage_client = storage.Client(credentials=credentials, project=project_id)
            except (json.JSONDecodeError, ValueError) as e:
                print(f"Warning: Failed to parse service account JSON: {e}")
                # Fallback to default credentials
                self.storage_client = storage.Client(project=project_id)
        else:
            # Fallback to default credentials (for local testing)
            self.storage_client = storage.Client(project=project_id)

    def scan(self):
        try:
            buckets = self.storage_client.list_buckets()
            for bucket in buckets:
                self.check_bucket_iam_policy(bucket)
        except Exception as e:
            print(f"GCP Bucket scan error: {e}")

        return self.findings

    def check_bucket_iam_policy(self, bucket):
        try:
            policy = bucket.get_iam_policy()
            for binding in policy.bindings:
                if 'allUsers' in binding['members']:
                    self.findings.append({
                        "severity": Severity.CRITICAL.value,
                        "title": "Public GCP Storage Bucket",
                        "resource": bucket.name,
                        "cloud_provider": "GCP", 
                        "account_id": self.project_id,  
                        "account_name": self.account_name,
                        "description": f"Bucket allows public access via IAM policy",
                        "resource_id": f"gs://{bucket.name}"
                    })
                    
                elif 'allAuthenticatedUsers' in binding['members']:
                    self.findings.append({
                        "severity": Severity.HIGH.value,
                        "title": "Public GCP Storage Bucket - Any Google Account Access",
                        "resource": bucket.name,
                        "cloud_provider": "GCP",
                        "account_id": self.project_id,
                        "account_name": self.account_name,
                        "description": f"Bucket '{bucket.name}' allows access to any authenticated Google account via IAM policy (allAuthenticatedUsers)",
                        "resource_id": f"gs://{bucket.name}"
                    })
        except Exception as e:
            print(f"Error checking bucket {bucket.name}: {e}")