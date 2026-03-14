from azure.mgmt.authorization import AuthorizationManagementClient
from azure.identity import DefaultAzureCredential, ClientSecretCredential
from core.enums import CloudProvider, Severity, FindingType
from typing import List, Dict

class AzureIAMScanner:
    """Scan Azure Active Directory and RBAC for security issues"""
    
    def __init__(self, tenant_id: str, client_id: str, client_secret: str, subscription_id: str, account_name: str):
        """Initialize Azure IAM scanner"""
        self.account_name = account_name
        self.subscription_id = subscription_id
        self.findings = [] 
        
        self.credential = ClientSecretCredential(
            tenant_id=tenant_id,
            client_id=client_id,
            client_secret=client_secret
        )
        
        self.auth_client = AuthorizationManagementClient(self.credential, subscription_id)
    
    def scan(self) -> List[Dict]:
        """Run all IAM security scans"""
        findings = []
        
        try:
            findings.extend(self._check_role_assignments())
            findings.extend(self._check_custom_roles())
        except Exception as e:
            print(f"Azure IAM scan error: {e}")
        
        return findings
    
    def _check_role_assignments(self) -> List[Dict]:
        """Check for overly permissive role assignments"""
        findings = []
        
        try:
            # Get all role assignments at subscription scope
            scope = f"/subscriptions/{self.subscription_id}"
            assignments = self.auth_client.role_assignments.list_for_scope(scope)
            
            # Check for Owner and Contributor assignments
            dangerous_roles = ["Owner", "Contributor"]
            
            for assignment in assignments:
                try:
                    role_def = self.auth_client.role_definitions.get_by_id(assignment.role_definition_id)
                    
                    if role_def.role_name in dangerous_roles:
                        findings.append({
                            "severity": "medium",
                            "title": f"Azure {role_def.role_name} role assigned",
                            "resource": assignment.principal_id,
                            "description": f"Principal has '{role_def.role_name}' role assigned with extensive permissions",
                            "cloud_provider": "Azure",
                            "account_id": self.subscription_id,
                            "account_name": self.account_name,
                            "resource_id": assignment.id
                        })
                except Exception as e:
                    continue
        except Exception as e:
            print(f"Error checking role assignments: {e}")
        
        return findings
    
    def _check_custom_roles(self) -> List[Dict]:
        """Check for overly permissive custom roles"""
        findings = []
        
        try:
            scope = f"/subscriptions/{self.subscription_id}"
            custom_roles = self.auth_client.role_definitions.list(scope, filter="type eq 'CustomRole'")
            
            for role in custom_roles:
                # Check if role has wildcard permissions
                if role.permissions:
                    for permission in role.permissions:
                        if permission.actions and '*' in permission.actions:
                            findings.append({
                                "severity": "high",
                                "title": "Azure custom role with wildcard permissions",
                                "resource": role.role_name,
                                "description": f"Custom role '{role.role_name}' contains wildcard (*) permissions",
                                "cloud_provider": "Azure",
                                "account_id": self.subscription_id,
                                "account_name": self.account_name,
                                "resource_id": role.id
                            })
                            break
        except Exception as e:
            print(f"Error checking custom roles: {e}")
        
        return findings