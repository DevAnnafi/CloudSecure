import requests
from core.enums import Severity, CloudProvider, FindingType

class MetaDataScanner():
    """
    GCP Metadata Scanner
    
    Note: This scanner checks if IMDS is accessible from the CURRENT machine.
    It will only find issues if CloudSecure is running ON a GCP instance.
    For Railway deployment, this will always return no findings.
    """
    
    METADATA_ENDPOINT = "http://metadata.google.internal/computeMetadata/v1/"
    
    def __init__(self, service_account_json=None, project_id=None, account_name=None):
        """
        Initialize GCP Metadata Scanner
        
        Args:
            service_account_json: Not used (metadata is local to instance)
            project_id: GCP project ID
            account_name: Account name for reporting
        """
        self.findings = []
        self.account_name = account_name or "Default"
        self.project_id = project_id or "N/A"

    def scan(self):
        self.check_imds_version()
        return self.findings

    def check_imds_version(self):
        if not self.check_imds_accessible():
            return  
        
        self.findings.append({
            "severity": Severity.CRITICAL.value,
            "title": "GCP IMDS Accessible",
            "resource": "GCP Instance",
            "cloud_provider": "GCP", 
            "account_id": self.project_id,  
            "account_name": self.account_name,
            "description": "Instance Metadata Service is accessible, metadata service is at a security risk",
            "resource_id": "metadata-service"
        })

    def check_imds_accessible(self):
        try:
            header = {"Metadata-Flavor": "Google"}
            response = requests.get(self.METADATA_ENDPOINT, headers=header, timeout=2)
            if response.status_code == 200:
                return True           
        except:
            pass

        return False