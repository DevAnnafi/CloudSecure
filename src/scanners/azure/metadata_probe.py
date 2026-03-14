import requests
from core.enums import Severity, CloudProvider, FindingType

class MetaDataProbe():
    """
    Azure Metadata Probe
    
    Note: This scanner checks if IMDS is accessible from the CURRENT machine.
    It will only find issues if CloudSecure is running ON an Azure VM.
    For Railway deployment, this will always return no findings.
    """
    
    METADATA_ENDPOINT = "http://169.254.169.254/metadata/instance?api-version=2021-02-01"
    
    def __init__(self, tenant_id=None, client_id=None, client_secret=None, subscription_id=None, account_name=None):
        """
        Initialize Azure Metadata Probe
        
        Args:
            tenant_id: Not used (metadata is local to VM)
            client_id: Not used (metadata is local to VM)
            client_secret: Not used (metadata is local to VM)
            subscription_id: Azure subscription ID
            account_name: Account name for reporting
        """
        self.findings = []
        self.account_name = account_name or "Default"
        self.subscription_id = subscription_id or "N/A"

    def scan(self):
        self.check_imds_version()
        return self.findings

    def check_imds_version(self):     
        if not self.check_imds_accessible():
            return  
        
        self.findings.append({
            "severity": Severity.CRITICAL.value,
            "title": "Azure IMDS Accessible",
            "resource": "Azure VM Instance",
            "cloud_provider": "Azure",  
            "account_id": self.subscription_id,  
            "account_name": self.account_name,
            "description": "Instance Metadata Service is accessible, potential SSRF attack",
            "resource_id": "metadata-service"
        })

    def check_imds_accessible(self):
        try:
            header = {"Metadata": "true"}
            response = requests.get(self.METADATA_ENDPOINT, headers=header, timeout=2)
            if response.status_code == 200:
                return True           
        except:
            pass

        return False