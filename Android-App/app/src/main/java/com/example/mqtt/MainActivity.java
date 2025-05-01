package com.example.mqtt;

import android.os.Bundle;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

public class MainActivity extends AppCompatActivity {

    private static final String BROKER_URL = "tcp://b61d745092d24387af27a598fce3e542.s1.eu.hivemq.cloud";
    private static final String CLIENT_ID = "IMIDT";
    private static final String USERNAME = "IMIDT"; // ← Replace this
    private static final String PASSWORD = "Imidt@123"; // ← Replace this
    private static final String TOPIC = "test/app";

    private MqttHandler mqttHandler;
    private TextView messageLog;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_main);

        messageLog = findViewById(R.id.messageLog);
        Button clearButton = findViewById(R.id.clearButton);

        clearButton.setOnClickListener(v -> messageLog.setText(""));

        mqttHandler = new MqttHandler();
        mqttHandler.setMessageListener((topic, message) -> runOnUiThread(() -> {
            String currentText = messageLog.getText().toString();
            messageLog.setText(currentText + "\n" + topic + ": " + message);
        }));

        mqttHandler.connect(BROKER_URL, CLIENT_ID, USERNAME, PASSWORD);
        subscribeToTopic(TOPIC);

        ViewCompat.setOnApplyWindowInsetsListener(
                findViewById(R.id.main),
                (v, insets) -> {
                    Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
                    v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
                    return insets;
                }
        );
    }

    @Override
    protected void onDestroy() {
        mqttHandler.disconnect();
        super.onDestroy();
    }

    private void publishMessage(String topic, String message) {
        Toast.makeText(this, "Publishing message: " + message, Toast.LENGTH_SHORT).show();
        mqttHandler.publish(topic, message);
    }

    private void subscribeToTopic(String topic) {
        Toast.makeText(this, "Subscribing to topic: " + topic, Toast.LENGTH_SHORT).show();
        mqttHandler.subscribe(topic);
    }
}