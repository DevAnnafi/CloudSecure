import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "src"))

from scanners.aws.iam_enum import IAMScanner

print("Starting IAM privilege escalation scan...")
print("-" * 50)

# Initialize scanner
scanner = IAMScanner()

# Run scan
try:
    findings = scanner.scan()
    
    # Print summary
    print(f"\n Scan complete!")
    print(f"Privilege escalation vectors found: {len(findings)}\n")
    
    if findings:
        print(" CRITICAL FINDINGS:")
        for f in findings:
            print(f"  - {f['title']}")
            print(f"    Description: {f['description']}\n")
    else:
        print("No privilege escalation vectors detected!")
        print("Your IAM user has appropriately restricted permissions.")
        
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()