#!/usr/bin/env python3

import json
import sys
import subprocess
from pathlib import Path

def main():
    if len(sys.argv) != 2:
        print("Usage: python scripts/update-version.py <version>")
        print("Example: python scripts/update-version.py 1.0.0")
        sys.exit(1)

    version = sys.argv[1]

    # Remove 'v' prefix if present
    if version.startswith('v'):
        version = version[1:]

    # Validate version format (basic check)
    parts = version.split('.')
    if len(parts) != 3 or not all(part.isdigit() for part in parts):
        print(f"Error: Invalid version format '{version}'. Expected format: X.Y.Z")
        sys.exit(1)

    # Read package.json
    package_json_path = Path(__file__).parent.parent / 'package.json'
    with open(package_json_path, 'r') as f:
        package_data = json.load(f)

    old_version = package_data.get('version', 'unknown')
    package_data['version'] = version

    # Write updated package.json
    with open(package_json_path, 'w') as f:
        json.dump(package_data, f, indent=2)
        f.write('\n')  # Add trailing newline

    print(f"Updated version: {old_version} -> {version}")

    # Git commit
    try:
        subprocess.run(['git', 'add', 'package.json'], check=True)
        subprocess.run(['git', 'commit', '-m', f'chore: release v{version}'], check=True)
        print(f"Created commit: chore: release v{version}")

        # Create tag
        subprocess.run(['git', 'tag', f'v{version}'], check=True)
        print(f"Created tag: v{version}")

        print(f"\nSuccess! Now run: git push --follow-tags")
    except subprocess.CalledProcessError as e:
        print(f"Error during git operations: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
