package com.example.mqtt;

import android.util.Log;

import org.eclipse.paho.client.mqttv3.IMqttDeliveryToken;
import org.eclipse.paho.client.mqttv3.MqttCallback;
import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence;

public class MqttHandler {

    private MqttClient client;
    private MessageListener messageListener;

    public interface MessageListener {
        void onMessageReceived(String topic, String message);
    }

    public void setMessageListener(MessageListener listener) {
        this.messageListener = listener;
    }

    public void connect(String brokerUrl, String clientId, String username, String password) {
        try {
            MemoryPersistence persistence = new MemoryPersistence();
            client = new MqttClient(brokerUrl, clientId, persistence);

            MqttConnectOptions connectOptions = new MqttConnectOptions();
            connectOptions.setCleanSession(true);
            connectOptions.setUserName(username);
            connectOptions.setPassword(password.toCharArray());

            client.setCallback(new MqttCallback() {
                @Override
                public void connectionLost(Throwable cause) {
                    Log.e("MQTT", "Connection lost", cause);
                }

                @Override
                public void messageArrived(String topic, MqttMessage message) {
                    String msg = message.toString();
                    Log.i("MQTT", "Message received: " + topic + " -> " + msg);
                    if (messageListener != null) {
                        messageListener.onMessageReceived(topic, msg);
                    }
                }

                @Override
                public void deliveryComplete(IMqttDeliveryToken token) {
                    // Nothing here
                }
            });

            client.connect(connectOptions);

        } catch (MqttException e) {
            e.printStackTrace();
        }
    }

    public void disconnect() {
        try {
            client.disconnect();
        } catch (MqttException e) {
            e.printStackTrace();
        }
    }

    public void publish(String topic, String message) {
        try {
            MqttMessage mqttMessage = new MqttMessage(message.getBytes());
            client.publish(topic, mqttMessage);
        } catch (MqttException e) {
            e.printStackTrace();
        }
    }

    public void subscribe(String topic) {
        try {
            client.subscribe(topic);
        } catch (MqttException e) {
            e.printStackTrace();
        }
    }
}