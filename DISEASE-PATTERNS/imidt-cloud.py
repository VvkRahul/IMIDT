'''
import firebase_admin
from firebase_admin import credentials, firestore

# Firebase Initialization
cred = credentials.Certificate('ServiceAccountKey.json')  # Update this path if needed
firebase_admin.initialize_app(cred)

# Firestore Client
db = firestore.client()

# 🔍 Mosquito-Borne Disease Detection Logic (Realistic Ranges)
def detect_mosquito_disease(temp, heart_rate, spo2):
    if 102.5 <= temp <= 104.0:
        return "Dengue"
    elif 101.5 <= temp <= 102.4:
        return "Malaria"
    elif 100.4 <= temp <= 101.4:
        return "Zika"
    elif 100.0 <= temp <= 101.4:
        return "Chikungunya"
    else:
        return "Healthy"

# 📥 Store Results to Firestore, Linked to Sensor Data ID
def store_disease_results(doc_id, data, condition):
    results_doc_id = f"{doc_id}_results"
    results_data = {
        "temperature": data["temperature"],
        "heart_rate": data["heart_rate"],
        "spo2": data["spo2"],
        "detected_condition": condition
    }
    db.collection("disease_results").document(results_doc_id).set(results_data)
    print(f"✅ Stored result for {doc_id}: {condition}")

# 🔁 Process Only Unseen Documents
def process_new_sensor_data():
    sensor_docs = db.collection("sensor_data").stream()
    results_docs = db.collection("disease_results").stream()

    # Get existing result IDs for skip logic
    existing_result_ids = {doc.id.replace("_results", "") for doc in results_docs}

    for doc in sensor_docs:
        doc_id = doc.id
        if doc_id in existing_result_ids:
            print(f"⏭️ Skipping already processed document: {doc_id}")
            continue

        data = doc.to_dict()
        print(f"\n📄 Processing Document: {doc_id}")
        print(f"🌡️ Temp: {data['temperature']} | ❤️ HR: {data['heart_rate']} | O₂: {data['spo2']}")

        condition = detect_mosquito_disease(data['temperature'], data['heart_rate'], data['spo2'])
        print(f"🧬 Detected Condition: {condition}")

        store_disease_results(doc_id, data, condition)

# 🚀 Run the detection process
process_new_sensor_data()
'''