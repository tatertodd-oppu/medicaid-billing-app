# String generation logic
def generate_billing_string(entry, recipient, constants):
    # Example template logic (simplified for clarity)
    string = f"{constants['prefix']}{recipient.medicaid_id:<10}{entry.date.strftime('%Y%m%d')}{entry.work_units:02}{entry.trip_units:02}{' ' * 10}"
    
    if len(string) != 75:
        raise ValueError(f"String length invalid: {len(string)}")

    return string

def export_to_txt(strings):
    return "\n".join(strings).encode("utf-8")
