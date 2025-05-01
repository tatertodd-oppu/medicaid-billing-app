@app.route("/api/billing-input", methods=["POST"])
def billing_input():
    entries = request.get_json()

    for entry in entries:
        recipient_id = entry.get("recipient_id")
        date = entry.get("date")

        work_raw = entry.get("work_units")
        trip_raw = entry.get("trip_units")

        work_units = int(work_raw) if str(work_raw).strip().isdigit() else None
        trip_units = int(trip_raw) if str(trip_raw).strip().isdigit() else None

        # If both are None or 0, skip
        if work_units is None and trip_units is None:
            continue

        db.session.add(BillingEntry(
            recipient_id=recipient_id,
            date=date,
            work_units=work_units,
            trip_units=trip_units
        ))

    db.session.commit()
    return jsonify({"status": "saved"})
