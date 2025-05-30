import tempfile
import os
from flask import Flask, request, jsonify, send_file, make_response
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os

app = Flask(__name__)
CORS(app, expose_headers=["Content-Disposition"])
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ["DATABASE_URL"]
db = SQLAlchemy(app)

# -------------------- MODELS --------------------

class Recipient(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    Last_Name = db.Column(db.String(12))
    First_Name = db.Column(db.String(12))
    Medicaid_ID = db.Column(db.String(12))
    Work_Service_Code = db.Column(db.String(3))
    Trip_Service_Code = db.Column(db.String(3))

    def to_dict(self):
        return {
            "id": self.id,
            "Last_Name": self.Last_Name,
            "First_Name": self.First_Name,
            "Medicaid_ID": self.Medicaid_ID,
            "Work_Service_Code": self.Work_Service_Code,
            "Trip_Service_Code": self.Trip_Service_Code,
        }

class Schedule(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    recipient_id = db.Column(db.Integer)
    weekday = db.Column(db.String(20))
    service_type = db.Column(db.String(20))

class BillingEntry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    recipient_id = db.Column(db.Integer)
    date = db.Column(db.String(20))
    work_units = db.Column(db.Integer)
    trip_units = db.Column(db.Integer)

# ✅ THIS MUST COME AFTER THE MODELS
with app.app_context():
    db.create_all()

# Routes
@app.route("/api/recipients", methods=["GET", "POST"])
def recipients():
    if request.method == "POST":
        data = request.get_json()
        work_code = data.get("Work_Service_Code", "")
        trip_code = data.get("Trip_Service_Code", "")

        if work_code and work_code.upper() not in {"ADF", "AVF", "FVF"}:
            return jsonify({"error": f"Invalid Work_Service_Code: {work_code}"}), 400

        if trip_code and trip_code.upper() not in {"ATB", "FTB"}:
            return jsonify({"error": f"Invalid Trip_Service_Code: {trip_code}"}), 400

        data["Work_Service_Code"] = work_code.upper()[:3]
        data["Trip_Service_Code"] = trip_code.upper()[:3]

        new_r = Recipient(**data)
        db.session.add(new_r)
        db.session.commit()
        return jsonify({"status": "ok"})
    else:
        return jsonify([r.to_dict() for r in Recipient.query.all()])

@app.route("/api/recipients/<int:id>", methods=["DELETE"])
def delete_recipient(id):
    r = Recipient.query.get(id)
    if not r:
        return jsonify({"error": "Recipient not found"}), 404
    db.session.delete(r)
    Schedule.query.filter_by(recipient_id=id).delete()
    db.session.commit()
    return jsonify({"status": "recipient and related schedules deleted"})


@app.route("/api/schedules", methods=["GET", "POST"])
def schedules():
    if request.method == "POST":
        data = request.get_json()
        new_s = Schedule(**data)
        db.session.add(new_s)
        db.session.commit()
        return jsonify({"status": "ok"})
    else:
        return jsonify([
            {
                "id": s.id,
                "recipient_id": s.recipient_id,
                "weekday": s.weekday,
                "service_type": s.service_type
            } for s in Schedule.query.all()
        ])

@app.route("/api/billing-input", methods=["POST"])
def billing_input():
    data = request.get_json()
    entries = data.get("entries", [])

    print("✅ Entries received:", entries)

    for entry in entries:
        print("➡️ Processing entry:", entry)

        # Safely get each field and validate
        recipient_id = entry.get("recipient_id")
        date = entry.get("date")
        work = entry.get("work_units", "").strip()
        trip = entry.get("trip_units", "").strip()

        # Skip entries with both fields empty
        if work == "" and trip == "":
            continue

        # Prepare fields (convert to int or None if blank)
        work_units = int(work) if work.isdigit() else None
        trip_units = int(trip) if trip.isdigit() else None

        db.session.add(BillingEntry(
            recipient_id=recipient_id,
            date=date,
            work_units=work_units,
            trip_units=trip_units
        ))

    db.session.commit()
    return jsonify({"status": "saved"})

from datetime import datetime

@app.route("/api/output", methods=["GET"])
def output():
    results = []
    recipients = {r.id: r for r in Recipient.query.all()}
    entries = BillingEntry.query.all()

    current_date = datetime.now().strftime("%m%d%y")  # MMDDYY (6 chars)
    form = "2"
    contract = "2573421"
    othercode = " "
    otheramount = "       "
    groupsize = "01"
    county = "25"
    optionalref = "         "
    staffsize = "01"
    workrate = "858"
    triprate = "3395"

    for e in entries:
        r = recipients.get(e.recipient_id)
        if not r:
            continue

        last_name = r.Last_Name[:5].upper()
        first_initial = r.First_Name[:1].upper()
        medicaid_id = r.Medicaid_ID
        billing_month = e.date.split("/")[0]
        billing_year = e.date.split("/")[2]
        day = e.date.split("/")[1]  # DD from MM/DD/YY

        if e.work_units:
            line = (
                f"{billing_month}"
                f"{billing_year}"
                f"{current_date}"
                f"{form}"
                f"{medicaid_id}"
                f"{last_name:<5}"
                f"{first_initial}"
                f"{contract}"
                f"{day}"
                f"{r.Work_Service_Code}"
                f"{str(e.work_units):>4}"
                f"{othercode}"
                f"{otheramount}"
                f"{groupsize}"
                f"{county}"
                f"{workrate:>7}"
                f"{optionalref}"
                f"{staffsize}"
            )
            results.append(line)

        if e.trip_units:
            line = (
                f"{billing_month}"
                f"{billing_year}"
                f"{current_date}"
                f"{form}"
                f"{medicaid_id}"
                f"{last_name:<5}"
                f"{first_initial}"
                f"{contract}"
                f"{day}"
                f"{r.Trip_Service_Code}"
                f"{str(e.trip_units):>4}"
                f"{othercode}"
                f"{otheramount}"
                f"{groupsize}"
                f"{county}"
                f"{triprate:>7}"
                f"{optionalref}"
                f"{staffsize}"
            )
            results.append(line)

    return jsonify(results)

@app.route("/api/export", methods=["GET"])
def export():
    lines = output().get_json()
    contract_number = "2573421"
    now = datetime.now()
    year = now.strftime("%y")
    week = str(now.isocalendar()[1]).zfill(2)
    filename = f"M{contract_number}X{year}000{week}.txt"

    temp_path = os.path.join(tempfile.gettempdir(), filename)
    
    with open(temp_path, "w") as f:
        for line in lines:
            f.write(line + "\n")
    # BillingEntry.query.delete()
    # db.session.commit()
    def delete_after_send(path):
        def inner():
            if os.path.exists(path):
                os.remove(path)
                print(f"Deleted export file] {path}")
        return inner       
    
    response = make_response(send_file(temp_path, as_attachment=True, download_name=filename, mimetype="text/plain"))
    response.headers["Content-Disposition"] = f'attachment; filename="{filename}"'
    response.call_on_close(delete_after_send(temp_path))
    return response

@app.route("/api/output", methods=["DELETE"])
def clear_output():
    BillingEntry.query.delete()
    db.session.commit()
    return jsonify({"status": "cleared"})

@app.route("/api/schedules/<int:id>", methods=["DELETE"])
def delete_schedule(id):
    s = Schedule.query.get(id)
    if s:
        db.session.delete(s)
        db.session.commit()
        return jsonify({"status": "deleted"})
    return jsonify({"error": "Not found"}), 404

# @app.route("/api/init-db", methods=["GET"])
# def init_db():
#     db.create_all()
#     return "Database initialized."

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
