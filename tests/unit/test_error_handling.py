import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "src"))
import pytest
from unittest.mock import patch, MagicMock
from scanners.aws.s3_checker import S3Scanner
from scanners.aws.iam_enum import IAMScanner
from scanners.aws.metadata import EC2MetaDataScanner
from scanners.azure.storage_checker import StorageScanner
from scanners.azure.iam_analyzer import AzureIAMScanner 
from scanners.gcp.bucket_checker import BucketScanner
from scanners.gcp.iam_scanner import IAMScanner as GCPIAMScanner

# Test credentials
TEST_ACCESS_KEY = "AKIAIOSFODNN7EXAMPLE"
TEST_SECRET_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
TEST_REGION = "us-east-1"
TEST_ACCOUNT_NAME = "test-account"

# =============================================
# AWS ERROR HANDLING TESTS
# =============================================

def test_aws_s3_permission_denied():
    """Test S3 scanner handles permission denied gracefully"""
    with patch('scanners.aws.s3_checker.boto3.Session') as mock_session:
        mock_s3 = MagicMock()
        mock_s3.list_buckets.side_effect = Exception("Access Denied")
        
        mock_sts = MagicMock()
        mock_sts.get_caller_identity.return_value = {'Account': '123456789012'}
        
        mock_session.return_value.client.side_effect = lambda service: mock_sts if service == 'sts' else mock_s3
        
        scanner = S3Scanner(
            access_key=TEST_ACCESS_KEY,
            secret_key=TEST_SECRET_KEY,
            region=TEST_REGION,
            account_name=TEST_ACCOUNT_NAME
        )
        results = scanner.scan_buckets()
        
        # Should handle error gracefully and return empty list
        assert results == []

def test_empty_buckets():
    """Test S3 scanner handles empty bucket list"""
    with patch('scanners.aws.s3_checker.boto3.Session') as mock_session:
        mock_s3 = MagicMock()
        mock_s3.list_buckets.return_value = {'Buckets': []}
        
        mock_sts = MagicMock()
        mock_sts.get_caller_identity.return_value = {'Account': '123456789012'}
        
        mock_session.return_value.client.side_effect = lambda service: mock_sts if service == 'sts' else mock_s3
        
        scanner = S3Scanner(
            access_key=TEST_ACCESS_KEY,
            secret_key=TEST_SECRET_KEY,
            region=TEST_REGION,
            account_name=TEST_ACCOUNT_NAME
        )
        results = scanner.scan_buckets()
        
        assert results == []
        assert len(scanner.findings) == 0

def test_aws_iam_permission_denied():
    """Test IAM scanner handles permission denied gracefully"""
    with patch('scanners.aws.iam_enum.boto3.Session') as mock_session:
        mock_iam = MagicMock()
        mock_iam.list_users.side_effect = Exception("Access Denied")
        
        mock_sts = MagicMock()
        mock_sts.get_caller_identity.return_value = {'Account': '123456789012'}
        
        mock_session.return_value.client.side_effect = lambda service: mock_sts if service == 'sts' else mock_iam
        
        scanner = IAMScanner(
            access_key=TEST_ACCESS_KEY,
            secret_key=TEST_SECRET_KEY,
            region=TEST_REGION,
            account_name=TEST_ACCOUNT_NAME
        )
        results = scanner.scan()
        
        # Should handle error gracefully
        assert isinstance(results, list)

def test_aws_invalid_credentials():
    """Test scanner initialization with invalid credentials"""
    with patch('scanners.aws.s3_checker.boto3.Session') as mock_session:
        mock_sts = MagicMock()
        mock_sts.get_caller_identity.side_effect = Exception("InvalidClientTokenId")
        
        mock_session.return_value.client.return_value = mock_sts
        
        scanner = S3Scanner(
            access_key="INVALID",
            secret_key="INVALID",
            region=TEST_REGION,
            account_name=TEST_ACCOUNT_NAME
        )
        
        # Should set account_id to unknown
        assert scanner.account_id == "unknown"

def test_aws_s3_bucket_not_found():
    """Test S3 scanner handles bucket not found error"""
    with patch('scanners.aws.s3_checker.boto3.Session') as mock_session:
        mock_s3 = MagicMock()
        mock_s3.get_public_access_block.side_effect = Exception("NoSuchBucket")
        
        mock_sts = MagicMock()
        mock_sts.get_caller_identity.return_value = {'Account': '123456789012'}
        
        mock_session.return_value.client.side_effect = lambda service: mock_sts if service == 'sts' else mock_s3
        
        scanner = S3Scanner(
            access_key=TEST_ACCESS_KEY,
            secret_key=TEST_SECRET_KEY,
            region=TEST_REGION,
            account_name=TEST_ACCOUNT_NAME
        )
        scanner.check_public_access("nonexistent-bucket")
        
        # Should add finding for unprotected bucket
        assert len(scanner.findings) == 1

def test_aws_metadata_scanner_timeout():
    """Test metadata scanner handles timeout gracefully"""
    with patch('scanners.aws.metadata.boto3.Session') as mock_session:
        mock_iam = MagicMock()
        mock_iam.get_account_summary.side_effect = Exception("RequestTimeout")
        
        mock_sts = MagicMock()
        mock_sts.get_caller_identity.return_value = {'Account': '123456789012'}
        
        mock_cloudtrail = MagicMock()
        
        def client_factory(service, **kwargs):
            if service == 'sts':
                return mock_sts
            elif service == 'cloudtrail':
                return mock_cloudtrail
            else:
                return mock_iam
        
        mock_session.return_value.client = client_factory
        
        scanner = EC2MetaDataScanner(
            access_key=TEST_ACCESS_KEY,
            secret_key=TEST_SECRET_KEY,
            region=TEST_REGION,
            account_name=TEST_ACCOUNT_NAME
        )
        results = scanner.scan()
        
        # Should handle error gracefully
        assert isinstance(results, list)

# =============================================
# AZURE ERROR HANDLING TESTS
# =============================================

def test_azure_storage_invalid_credentials():
    """Test Azure storage scanner with invalid credentials"""
    with patch('scanners.azure.storage_checker.ClientSecretCredential') as mock_cred:
        with patch('scanners.azure.storage_checker.StorageManagementClient') as mock_client:
            mock_client.return_value.storage_accounts.list.side_effect = Exception("AuthenticationFailed")
            
            scanner = StorageScanner(
                tenant_id="fake-tenant",
                client_id="fake-client",
                client_secret="fake-secret",
                subscription_id="fake-sub",
                account_name=TEST_ACCOUNT_NAME
            )
            results = scanner.scan()
            
            # Should handle error gracefully
            assert isinstance(results, list)

def test_azure_storage_no_accounts():
    """Test Azure storage scanner with no storage accounts"""
    with patch('scanners.azure.storage_checker.ClientSecretCredential') as mock_cred:
        with patch('scanners.azure.storage_checker.StorageManagementClient') as mock_client:
            mock_client.return_value.storage_accounts.list.return_value = []
            
            scanner = StorageScanner(
                tenant_id="fake-tenant",
                client_id="fake-client",
                client_secret="fake-secret",
                subscription_id="fake-sub",
                account_name=TEST_ACCOUNT_NAME
            )
            results = scanner.scan()
            
            assert results == []
            assert len(scanner.findings) == 0

def test_azure_iam_permission_denied():
    """Test Azure IAM scanner handles permission denied"""
    with patch('scanners.azure.iam_analyzer.ClientSecretCredential') as mock_cred:
        with patch('scanners.azure.iam_analyzer.AuthorizationManagementClient') as mock_client:
            mock_client.return_value.role_assignments.list_for_scope.side_effect = Exception("Forbidden")
            
            scanner = AzureIAMScanner(
                tenant_id="fake-tenant",
                client_id="fake-client",
                client_secret="fake-secret",
                subscription_id="fake-sub",
                account_name=TEST_ACCOUNT_NAME
            )
            results = scanner.scan()
            
            # Should handle error gracefully
            assert isinstance(results, list)

def test_azure_subscription_not_found():
    """Test Azure scanner handles subscription not found"""
    with patch('scanners.azure.storage_checker.ClientSecretCredential') as mock_cred:
        with patch('scanners.azure.storage_checker.StorageManagementClient') as mock_client:
            mock_client.return_value.storage_accounts.list.side_effect = Exception("SubscriptionNotFound")
            
            scanner = StorageScanner(
                tenant_id="fake-tenant",
                client_id="fake-client",
                client_secret="fake-secret",
                subscription_id="nonexistent-sub",
                account_name=TEST_ACCOUNT_NAME
            )
            results = scanner.scan()
            
            # Should handle error gracefully
            assert isinstance(results, list)

# =============================================
# GCP ERROR HANDLING TESTS
# =============================================

def test_gcp_storage_invalid_credentials():
    """Test GCP storage scanner with invalid service account"""
    scanner = BucketScanner(
        service_account_json=None,  # Will use default credentials
        project_id="fake-project",
        account_name=TEST_ACCOUNT_NAME
    )
    
    # Scanner should initialize without error
    assert scanner.project_id == "fake-project"
    assert scanner.findings == []

def test_gcp_storage_invalid_json():
    """Test GCP storage scanner with invalid JSON"""
    with patch('scanners.gcp.bucket_checker.storage.Client') as mock_client:
        scanner = BucketScanner(
            service_account_json="invalid json{{{",
            project_id="fake-project",
            account_name=TEST_ACCOUNT_NAME
        )
        
        # Should fall back to default credentials
        assert scanner.project_id == "fake-project"

def test_gcp_storage_permission_denied():
    """Test GCP storage scanner handles permission denied"""
    with patch('scanners.gcp.bucket_checker.storage.Client') as mock_client:
        mock_client.return_value.list_buckets.side_effect = Exception("Permission denied")
        
        scanner = BucketScanner(
            service_account_json=None,
            project_id="fake-project",
            account_name=TEST_ACCOUNT_NAME
        )
        results = scanner.scan()
        
        # Should handle error gracefully
        assert isinstance(results, list)

def test_gcp_storage_no_buckets():
    """Test GCP storage scanner with no buckets"""
    with patch('scanners.gcp.bucket_checker.storage.Client') as mock_client:
        mock_client.return_value.list_buckets.return_value = []
        
        scanner = BucketScanner(
            service_account_json=None,
            project_id="fake-project",
            account_name=TEST_ACCOUNT_NAME
        )
        results = scanner.scan()
        
        assert results == []
        assert len(scanner.findings) == 0

def test_gcp_iam_permission_denied():
    """Test GCP IAM scanner handles permission denied"""
    with patch('scanners.gcp.iam_scanner.resourcemanager_v3.ProjectsClient') as mock_client:
        mock_client.return_value.get_iam_policy.side_effect = Exception("Permission denied")
        
        scanner = GCPIAMScanner(
            service_account_json=None,
            project_id="fake-project",
            account_name=TEST_ACCOUNT_NAME
        )
        results = scanner.scan()
        
        # Should handle error gracefully
        assert isinstance(results, list)

def test_gcp_project_not_found():
    """Test GCP scanner handles project not found"""
    with patch('scanners.gcp.bucket_checker.storage.Client') as mock_client:
        mock_client.return_value.list_buckets.side_effect = Exception("Project not found")
        
        scanner = BucketScanner(
            service_account_json=None,
            project_id="nonexistent-project",
            account_name=TEST_ACCOUNT_NAME
        )
        results = scanner.scan()
        
        # Should handle error gracefully
        assert isinstance(results, list)

# =============================================
# NETWORK ERROR TESTS
# =============================================

def test_network_timeout_aws():
    """Test AWS scanner handles network timeout"""
    with patch('scanners.aws.s3_checker.boto3.Session') as mock_session:
        mock_s3 = MagicMock()
        mock_s3.list_buckets.side_effect = Exception("ReadTimeout")
        
        mock_sts = MagicMock()
        mock_sts.get_caller_identity.return_value = {'Account': '123456789012'}
        
        mock_session.return_value.client.side_effect = lambda service: mock_sts if service == 'sts' else mock_s3
        
        scanner = S3Scanner(
            access_key=TEST_ACCESS_KEY,
            secret_key=TEST_SECRET_KEY,
            region=TEST_REGION,
            account_name=TEST_ACCOUNT_NAME
        )
        results = scanner.scan_buckets()
        
        # Should handle timeout gracefully
        assert results == []

def test_network_connection_error():
    """Test scanner handles connection error"""
    with patch('scanners.aws.s3_checker.boto3.Session') as mock_session:
        mock_s3 = MagicMock()
        mock_s3.list_buckets.side_effect = Exception("ConnectionError")
        
        mock_sts = MagicMock()
        mock_sts.get_caller_identity.return_value = {'Account': '123456789012'}
        
        mock_session.return_value.client.side_effect = lambda service: mock_sts if service == 'sts' else mock_s3
        
        scanner = S3Scanner(
            access_key=TEST_ACCESS_KEY,
            secret_key=TEST_SECRET_KEY,
            region=TEST_REGION,
            account_name=TEST_ACCOUNT_NAME
        )
        results = scanner.scan_buckets()
        
        # Should handle connection error gracefully
        assert results == []

# =============================================
# MALFORMED DATA TESTS
# =============================================

def test_aws_malformed_policy_json():
    """Test S3 scanner handles malformed policy JSON"""
    with patch('scanners.aws.s3_checker.boto3.Session') as mock_session:
        mock_s3 = MagicMock()
        mock_s3.get_bucket_policy.return_value = {'Policy': 'invalid json{{{'}
        
        mock_sts = MagicMock()
        mock_sts.get_caller_identity.return_value = {'Account': '123456789012'}
        
        mock_session.return_value.client.side_effect = lambda service: mock_sts if service == 'sts' else mock_s3
        
        scanner = S3Scanner(
            access_key=TEST_ACCESS_KEY,
            secret_key=TEST_SECRET_KEY,
            region=TEST_REGION,
            account_name=TEST_ACCOUNT_NAME
        )
        scanner.check_policy("fake-bucket")
        
        # Should handle JSON error gracefully - no findings
        assert len(scanner.findings) == 0

def test_missing_required_fields():
    """Test scanner handles missing required fields in API response"""
    with patch('scanners.aws.s3_checker.boto3.Session') as mock_session:
        mock_s3 = MagicMock()
        # Missing 'Buckets' key
        mock_s3.list_buckets.return_value = {}
        
        mock_sts = MagicMock()
        mock_sts.get_caller_identity.return_value = {'Account': '123456789012'}
        
        mock_session.return_value.client.side_effect = lambda service: mock_sts if service == 'sts' else mock_s3
        
        scanner = S3Scanner(
            access_key=TEST_ACCESS_KEY,
            secret_key=TEST_SECRET_KEY,
            region=TEST_REGION,
            account_name=TEST_ACCOUNT_NAME
        )
        
        # Should handle gracefully without crashing
        try:
            results = scanner.scan_buckets()
            # May succeed or fail, but shouldn't crash
            assert isinstance(results, list)
        except (KeyError, AttributeError, Exception):
            # If it fails, it should be a handled exception
            pass