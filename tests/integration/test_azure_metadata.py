import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "src"))

from scanners.azure.metadata_probe import MetaDataProbe
import subprocess

print("Starting Azure Metadata scan...")
print("-" * 50)

scanner = MetaDataProbe()

try:
    findings = scanner.scan()
    
    print(f"Scan complete!")
    print(f"Metadata vulnerabilities found: {len(findings)}\n")
    
    if findings:
        print("CRITICAL:")
        for f in findings:
            print(f"  -  {f['title']}")
            print(f"    {f['description']}\n")
    else:
        print("Not running on Azure VM or IMDS is secure!")
        
except Exception as e:
    print(f" Error: {e}")
    import traceback
    traceback.print_exc()