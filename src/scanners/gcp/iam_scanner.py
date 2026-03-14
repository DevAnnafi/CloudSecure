from google.cloud import resourcemanager_v3
from google.oauth2 import service_account
from core.enums import CloudProvider, Severity, FindingType
import json

class IAMScanner():
    def __init__(self, service_account_json=None, project_id=None, account_name=None):
        """
        Initialize GCP IAM Scanner with service account credentials
        
        Args:
            service_account_json: JSON string of service account key
            project_id: GCP project ID
            account_name: Account name for reporting
        """
        self.findings = []
        self.project_id = project_id
        self.account_name = account_name or "Default"
        
        # Parse service account JSON and create credentials
        if service_account_json:
            sa_dict = json.loads(service_account_json)
            credentials = service_account.Credentials.from_service_account_info(sa_dict)
            self.projects_client = resourcemanager_v3.ProjectsClient(credentials=credentials)
        else:
            # Fallback to default credentials (for local testing)
            self.projects_client = resourcemanager_v3.ProjectsClient()

    def scan(self):
        try:
            request = resourcemanager_v3.GetIamPolicyRequest(resource=f"projects/{self.project_id}")
            policy = self.projects_client.get_iam_policy(request=request)

            for binding in policy.bindings:
                self.check_binding(binding)
        except Exception as e:
            print(f"GCP IAM scan error: {e}")

        return self.findings

    def check_binding(self, binding):
        if binding.role == "roles/owner":
            self.findings.append({
                "severity": Severity.CRITICAL.value,
                "title": "Overly Permissive GCP IAM Binding - Owner",
                "resource": binding.role,
                "cloud_provider": "GCP",
                "account_id": self.project_id,
                "account_name": self.account_name,
                "description": f"Role {binding.role} grants full project control",
                "resource_id": f"project:{self.project_id}/role:{binding.role}"
            })
        
        elif binding.role == "roles/editor":
            self.findings.append({
                "severity": Severity.HIGH.value,
                "title": "Overly Permissive GCP IAM Binding - Editor",
                "resource": binding.role,
                "cloud_provider": "GCP",
                "account_id": self.project_id,
                "account_name": self.account_name,
                "description": f"Role {binding.role} grants broad resource modification permissions but not IAM control",
                "resource_id": f"project:{self.project_id}/role:{binding.role}"
            })
        
        if 'allUsers' in binding.members:
            self.findings.append({
                "severity": Severity.CRITICAL.value,
                "title": "Public GCP IAM Binding - Internet Access",
                "resource": binding.role,
                "cloud_provider": "GCP",
                "account_id": self.project_id,
                "account_name": self.account_name,
                "description": f"Role {binding.role} is assumable by anyone on the internet (allUsers)",
                "resource_id": f"project:{self.project_id}/role:{binding.role}"
            })
        
        elif 'allAuthenticatedUsers' in binding.members:
            self.findings.append({
                "severity": Severity.HIGH.value,
                "title": "Public GCP IAM Binding - Any Google Account",
                "resource": binding.role,
                "cloud_provider": "GCP",
                "account_id": self.project_id,
                "account_name": self.account_name,
                "description": f"Role {binding.role} is assumable by any authenticated Google account (allAuthenticatedUsers)",
                "resource_id": f"project:{self.project_id}/role:{binding.role}"
            })