import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "src"))

from scanners.gcp import BucketScanner, IAMScanner, MetaDataScanner
import subprocess

print("=" * 60)
print("COMPLETE GCP SECURITY SCAN")
print("=" * 60)

# Get project ID
result = subprocess.run(['gcloud', 'config', 'get-value', 'project'], 
                       capture_output=True, text=True)
project_id = result.stdout.strip()

print(f"\nUsing project: {project_id}\n")

all_findings = []

# Bucket Scanner
print("[1/3] Scanning GCP Storage buckets...")
bucket_scanner = BucketScanner(project_id)
bucket_findings = bucket_scanner.scan()
all_findings.extend(bucket_findings)
print(f"  → Found {len(bucket_findings)} storage issues")

# IAM Scanner
print("\n[2/3] Scanning GCP IAM...")
iam_scanner = IAMScanner(project_id)
iam_findings = iam_scanner.scan()
all_findings.extend(iam_findings)
print(f"  → Found {len(iam_findings)} IAM issues")

# Metadata Scanner
print("\n[3/3] Scanning GCP Metadata...")
metadata_scanner = MetaDataScanner()
metadata_findings = metadata_scanner.scan()
all_findings.extend(metadata_findings)
print(f"  → Found {len(metadata_findings)} metadata issues")

# Summary
print("\n" + "=" * 60)
print(f"TOTAL FINDINGS: {len(all_findings)}")
print("=" * 60)

if all_findings:
    critical = [f for f in all_findings if f['severity'] == 'critical']
    
    if critical:
        print(f"\nCRITICAL ({len(critical)}):")
        for f in critical:
            print(f"  - {f['title']}")
            print(f"    Resource: {f['resource']}")
else:
    print("\nNo security issues found across all GCP services!")