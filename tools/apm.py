
import argparse
import os
import shutil
import json
import time

REGISTRY = {
    "math-lib": {
        "version": "1.0.0",
        "files": {
            "math.aurora": "define add(a, b):\n    return a + b\nend\n\ndefine square(x):\n    return x * x\nend"
        }
    },
    "utils": {
        "version": "0.5.0",
        "files": {
            "logger.aurora": "define log(msg):\n    say \"[LOG] \" + msg\nend"
        }
    }
}

PACKAGES_DIR = "packages"

def install(package_name):
    print(f"🔍 Searching for {package_name}...")
    time.sleep(0.5)
    
    if package_name not in REGISTRY:
        print(f"❌ Package '{package_name}' not found in registry.")
        return

    pkg_data = REGISTRY[package_name]
    print(f"⬇️  Downloading {package_name} v{pkg_data['version']}...")
    time.sleep(1)
    
    target_dir = os.path.join(PACKAGES_DIR, package_name)
    if not os.path.exists(target_dir):
        os.makedirs(target_dir)
    
    for filename, content in pkg_data['files'].items():
        with open(os.path.join(target_dir, filename), 'w') as f:
            f.write(content)
            
    print(f"✅ Successfully installed {package_name}!")

def remove(package_name):
    target_dir = os.path.join(PACKAGES_DIR, package_name)
    if os.path.exists(target_dir):
        shutil.rmtree(target_dir)
        print(f"🗑️  Removed {package_name}.")
    else:
        print(f"⚠️  Package {package_name} is not installed.")

def list_packages():
    if not os.path.exists(PACKAGES_DIR):
        print("No packages installed.")
        return

    packages = os.listdir(PACKAGES_DIR)
    if not packages:
        print("No packages installed.")
    else:
        print("📦 Installed Packages:")
        for p in packages:
            print(f" - {p}")

def main():
    parser = argparse.ArgumentParser(description="Aurora Package Manager (apm)")
    subparsers = parser.add_subparsers(dest='command')
    
    install_parser = subparsers.add_parser('install', help='Install a package')
    install_parser.add_argument('package', help='Package name')
    
    remove_parser = subparsers.add_parser('remove', help='Remove a package')
    remove_parser.add_argument('package', help='Package name')
    
    subparsers.add_parser('list', help='List installed packages')
    
    args = parser.parse_args()
    
    if args.command == 'install':
        install(args.package)
    elif args.command == 'remove':
        remove(args.package)
    elif args.command == 'list':
        list_packages()
    else:
        parser.print_help()

if __name__ == '__main__':
    main()
