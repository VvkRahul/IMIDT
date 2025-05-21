import tkinter as tk
from tkinter import ttk
import time
import paho.mqtt.client as mqtt
import json
from datetime import datetime
import random  # To generate randomized data
#import firebase_admin
#from firebase_admin import credentials, firestore

class DigitalTwinSimulator:
    def __init__(self):
        self.index = 0
        self.running = False

    def get_next(self):
        # Realistic human-based randomized values
        values = {
            "temperature": round(random.uniform(97.8, 105.0), 1),  # Temperature (°F) - typical normal range
            "spo2": random.randint(95, 100),  # SPO2 (%) - normal healthy levels
            "heart_rate": random.randint(60, 100)  # Heart rate (bpm) - normal resting range
        }
        
        # Simulating occasional variation for realism:
        if random.random() < 0.05:  # 5% chance to simulate a fever
            values["temperature"] = round(random.uniform(100.0, 103.5), 1)  # Fever range for temperature

        if random.random() < 0.1:  # 10% chance to simulate low SPO2
            values["spo2"] = random.randint(85, 94)  # Low SPO2 levels

        if random.random() < 0.1:  # 10% chance to simulate an elevated heart rate
            values["heart_rate"] = random.randint(101, 160)  # Elevated heart rate due to stress, illness, or exercise
        
        return values

class App:
    def __init__(self, root):
        self.sim = DigitalTwinSimulator()
        self.root = root
        self.root.title("IMIDT: Digital Twin Sensor-Based Vitals")
        self.root.geometry("400x300")

        self.create_widgets()

        '''MQTT Setup
        self.broker = "d99235ef96104298b9fa4e97ddae6cee.s1.eu.hivemq.cloud"
        self.port = 8883
        self.base_topic = "imidt/vitals"
        self.client = mqtt.Client() 

        # MQTT Authentication
        self.client.username_pw_set(
            username="IMIDT",
            password="MyIMIDT@123"
        )

        # MQTT Callbacks
        self.client.on_connect = self.on_connect
        self.client.on_disconnect = self.on_disconnect
        self.client.on_publish = self.on_publish

        # Enable SSL
        self.client.tls_set()

        try:
            self.client.connect(self.broker, self.port, 60)
            self.client.loop_start()
        except Exception as e:
            print(f"Error connecting to MQTT Broker: {e}")

        # Firebase Initialization
        self.initialize_firebase()

    def initialize_firebase(self):
        # Initialize Firebase Admin SDK
        cred = credentials.Certificate("your firebase creds file)  # Path to your service account JSON file
        firebase_admin.initialize_app(cred)

        # Initialize Firestore
        self.db = firestore.client() '''

    def on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            print("Connected to MQTT Broker successfully!")
        else:
            print(f"Failed to connect with result code {rc}")

    def on_disconnect(self, client, userdata, rc):
        if rc != 0:
            print(f"Unexpected disconnection. Result code: {rc}")
        else:
            print("Disconnected from MQTT Broker.")

    def on_publish(self, client, userdata, mid):
        print(f"Message {mid} successfully published.")

    def create_widgets(self):
        ttk.Label(self.root, text="IMIDT Digital Twin", font=("Arial", 12)).pack(pady=10)

        self.next_btn = ttk.Button(self.root, text="Start Simulation", command=self.generate_next)
        self.next_btn.pack(pady=10)

        self.temp_label = ttk.Label(self.root, text="Temperature: -- °F", font=("Arial", 11))
        self.temp_label.pack(pady=5)

        self.spo2_label = ttk.Label(self.root, text="SPO2: -- %", font=("Arial", 11))
        self.spo2_label.pack(pady=5)

        self.hr_label = ttk.Label(self.root, text="Heart Rate: -- bpm", font=("Arial", 11))
        self.hr_label.pack(pady=5)

    def generate_next(self):
        # Generate new data on each button click
        data = self.sim.get_next()

        # Update GUI with new values
        self.temp_label.config(text=f"Temperature: {data['temperature']} °F")
        self.spo2_label.config(text=f"SPO2: {data['spo2']} %")
        self.hr_label.config(text=f"Heart Rate: {data['heart_rate']} bpm")

        payload = json.dumps(data)

        # Fetch the current number of documents in Firestore collection "sensor_data"
        docs = self.db.collection("sensor_data").stream()
        doc_count = sum(1 for _ in docs)

        # Naming the new document as 'new_data_<doc_count + 1>' 
        new_document_name = f"new_data_{doc_count + 1}"

        # Firebase - Store in Firestore under the new name
        self.db.collection("sensor_data").document(new_document_name).set(data)
        print(f"Data stored in Firebase under document ID: {new_document_name}")

        # Unique topic using timestamp to avoid overwrite
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        topic = f"{self.base_topic}/{timestamp}"

        result = self.client.publish(topic, payload, qos=1, retain=False)

        if result.rc != mqtt.MQTT_ERR_SUCCESS:
            print(f"Error publishing message: {result.rc}")
        else:
            print(f"Published to {topic}: {payload}")

if __name__ == "__main__":
    root = tk.Tk()
    app = App(root)
    root.mainloop()