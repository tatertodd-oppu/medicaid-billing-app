
Medicaid Billing App — Local Install Instructions (macOS)

1. Open Terminal and navigate to the backend folder:
   cd path/to/medicaid-billing-app/backend

2. Create virtual environment and activate it:
   python3 -m venv venv
   source venv/bin/activate

3. Install backend dependencies:
   pip install -r requirements.txt

4. Start the backend server:
   python app.py

5. Open new terminal, navigate to frontend folder:
   cd path/to/medicaid-billing-app/frontend

6. Install frontend dependencies:
   npm install

7. Start the frontend:
   npm start

Your app will run at http://localhost:3000
