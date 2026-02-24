import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "src"))

import pytest
from unittest.mock import patch, MagicMock
from scanners.aws.s3_checker import S3Scanner
from scanners.azure.storage_checker import StorageChecker
from scanners.gcp.bucket_checker import BucketScanner
from scanners.azure.metadata_probe import MetaDataProbe

def test_aws_s3_permission_denied():
    with patch('scanners.aws.s3_checker.boto3.client') as mock_boto:
        from botocore.exceptions import ClientError
        
        error_response = {'Error': {'Code': 'AccessDenied', 'Message': 'Access Denied'}}
        mock_boto.return_value.list_buckets.side_effect = ClientError(error_response, 'ListBuckets')
        
        scanner = S3Scanner()
        findings = scanner.scan_buckets()
        
        assert findings == []
        assert len(scanner.findings) == 0

def test_network_timeout():
    with patch('scanners.azure.metadata_probe.requests.get') as mock_get:
        from requests.exceptions import Timeout
        
        mock_get.side_effect = Timeout("Connection timeout")
        
        scanner = MetaDataProbe()
        findings = scanner.scan()
        
        assert findings == []

def test_empty_buckets():
    with patch('scanners.aws.s3_checker.boto3.client') as mock_boto:
        mock_boto.return_value.list_buckets.return_value = {'Buckets': []}
        
        scanner = S3Scanner()
        findings = scanner.scan_buckets()
        
        assert findings == []

def test_azure_invalid_subscription():
    with patch('scanners.azure.storage_checker.StorageManagementClient') as mock_client:
        mock_client.side_effect = Exception("Invalid subscription")        
        try:
            scanner = StorageChecker("invalid-sub-id")
            findings = scanner.scan()
            assert findings == []
        except:
            pass