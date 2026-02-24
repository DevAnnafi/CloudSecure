import argparse
from scanners.aws import S3Scanner, IAMScanner, EC2MetaDataScanner
from core import CloudProvider, progress_context, ReportGenerator

def main():
    parser = argparse.ArgumentParser(
        description="CloudStrike - Multi-Cloud Security Scanner"
    )
    subparsers = parser.add_subparsers(dest='command')
    scan_parser = subparsers.add_parser('scan', help='Scan cloud infrastructure for vulnerabilities')
    scan_parser.add_argument('--aws', action='store_true')
    scan_parser.add_argument('--output', required=True)
    scan_parser.add_argument('--format', choices=['json', 'html'], default='json')
    args = parser.parse_args()
    if args.command == 'scan':
        run_scan(args)

def run_scan(args):
    all_findings = []
    if args.aws is True:
        scanner = S3Scanner()
        findings = scanner.scan_buckets()
        all_findings.extend(findings)

        iam_scanner = IAMScanner()
        findings = iam_scanner.scan()
        all_findings.extend(findings)

        ec2_scanner = EC2MetaDataScanner()
        findings = ec2_scanner.scan()
        all_findings.extend(findings)

    report = ReportGenerator(all_findings, "AWS")
    report.save_json(args.output)
    print(f"Report saved to {args.output} with {len(all_findings)} findings")
    

if __name__ == "__main__":
    main()