from setuptools import setup, find_packages

setup(
    name="aurora-lang",
    version="1.0.0",
    description="The friendliest programming language for data-driven dreamers.",
    author="Prince Pandey",
    packages=find_packages("source"),
    package_dir={"": "source"},
    entry_points={
        "console_scripts": [
            "aurora=aurora.shell:main",
        ],
    },
    python_requires=">=3.8",
)
