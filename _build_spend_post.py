import json
from pathlib import Path
from typing import List, Dict, Any

def load_json_file(filepath: str) -> List[Any]:
    """Load and parse a JSON file."""
    path = Path(filepath)
    if not path.exists():
        raise FileNotFoundError(f"File not found: {filepath}")

    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    return data

def validate_spend_raw(data: List[Any]) -> None:
    """Validate _spendRaw.json structure: [date, total_spend, posts_boosted]"""
    if not isinstance(data, list):
        raise ValueError("_spendRaw.json should be a list")

    if len(data) == 0:
        print("Warning: _spendRaw.json is empty")
        return

    for i, record in enumerate(data):
        if not isinstance(record, list) or len(record) != 3:
            raise ValueError(f"Record {i} has invalid structure. Expected [date, total_spend, posts_boosted], got: {record}")

        date, total_spend, posts_boosted = record
        if not isinstance(date, str):
            raise ValueError(f"Record {i}: date should be string, got {type(date)}")
        if not isinstance(total_spend, (int, float)):
            raise ValueError(f"Record {i}: total_spend should be numeric, got {type(total_spend)}")
        if not isinstance(posts_boosted, int):
            raise ValueError(f"Record {i}: posts_boosted should be int, got {type(posts_boosted)}")

def validate_spend_perfil_raw(data: List[Any]) -> None:
    """Validate _spendPerfilRaw.json structure: [date, perfil, total_spend, posts_boosted]"""
    if not isinstance(data, list):
        raise ValueError("_spendPerfilRaw.json should be a list")

    if len(data) == 0:
        print("Warning: _spendPerfilRaw.json is empty")
        return

    for i, record in enumerate(data):
        if not isinstance(record, list) or len(record) != 4:
            raise ValueError(f"Record {i} has invalid structure. Expected [date, perfil, total_spend, posts_boosted], got: {record}")

        date, perfil, total_spend, posts_boosted = record
        if not isinstance(date, str):
            raise ValueError(f"Record {i}: date should be string, got {type(date)}")
        if not isinstance(perfil, str):
            raise ValueError(f"Record {i}: perfil should be string, got {type(perfil)}")
        if not isinstance(total_spend, (int, float)):
            raise ValueError(f"Record {i}: total_spend should be numeric, got {type(total_spend)}")
        if not isinstance(posts_boosted, int):
            raise ValueError(f"Record {i}: posts_boosted should be int, got {type(posts_boosted)}")

def print_summary_stats(spend_raw: List[Any], spend_perfil: List[Any]) -> None:
    """Print summary statistics for both datasets."""
    print("\n" + "="*60)
    print("SUMMARY STATISTICS")
    print("="*60)

    print("\n_spendRaw.json:")
    print(f"  Total records: {len(spend_raw)}")
    if len(spend_raw) > 0:
        total_spend = sum(record[1] for record in spend_raw)
        total_posts = sum(record[2] for record in spend_raw)
        avg_spend = total_spend / len(spend_raw)
        dates = [record[0] for record in spend_raw]
        print(f"  Date range: {min(dates)} to {max(dates)}")
        print(f"  Total spend: ${total_spend:,.2f}")
        print(f"  Total posts boosted: {total_posts}")
        print(f"  Average spend per day: ${avg_spend:,.2f}")

    print("\n_spendPerfilRaw.json:")
    print(f"  Total records: {len(spend_perfil)}")
    if len(spend_perfil) > 0:
        total_spend = sum(record[2] for record in spend_perfil)
        total_posts = sum(record[3] for record in spend_perfil)
        avg_spend = total_spend / len(spend_perfil)
        dates = [record[0] for record in spend_perfil]
        perfiles = set(record[1] for record in spend_perfil)
        print(f"  Date range: {min(dates)} to {max(dates)}")
        print(f"  Unique profiles: {len(perfiles)}")
        print(f"  Profiles: {sorted(perfiles)}")
        print(f"  Total spend: ${total_spend:,.2f}")
        print(f"  Total posts boosted: {total_posts}")
        print(f"  Average spend per record: ${avg_spend:,.2f}")

    print("\n" + "="*60)

def main():
    """Main function to load and validate both JSON files."""
    base_path = Path(__file__).parent
    spend_raw_path = base_path / "_spendRaw.json"
    spend_perfil_path = base_path / "_spendPerfilRaw.json"

    try:
        print(f"Loading {spend_raw_path}...")
        spend_raw = load_json_file(str(spend_raw_path))
        validate_spend_raw(spend_raw)
        print("[OK] _spendRaw.json loaded and validated successfully")

        print(f"\nLoading {spend_perfil_path}...")
        spend_perfil = load_json_file(str(spend_perfil_path))
        validate_spend_perfil_raw(spend_perfil)
        print("[OK] _spendPerfilRaw.json loaded and validated successfully")

        print_summary_stats(spend_raw, spend_perfil)
        print("\nValidation completed successfully!")

    except FileNotFoundError as e:
        print(f"ERROR: {e}")
        return 1
    except json.JSONDecodeError as e:
        print(f"ERROR: Invalid JSON format - {e}")
        return 1
    except ValueError as e:
        print(f"ERROR: Validation failed - {e}")
        return 1
    except Exception as e:
        print(f"ERROR: Unexpected error - {e}")
        return 1

    return 0

if __name__ == "__main__":
    exit(main())
