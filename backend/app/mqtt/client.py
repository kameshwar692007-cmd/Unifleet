import json
import logging
import asyncio
import paho.mqtt.client as mqtt
from typing import Dict, Any, Callable, Optional
from app.config import settings
from app.adapters.factory import adapter_factory

logger = logging.getLogger("unifleet.mqtt")

class MQTTManager:
    def __init__(self):
        self.client: Optional[mqtt.Client] = None
        self.telemetry_callbacks: list = []
        self.is_connected = False

    def register_telemetry_callback(self, callback: Callable[[Dict[str, Any]], None]):
        self.telemetry_callbacks.append(callback)

    def on_connect(self, client, userdata, flags, rc, properties=None):
        logger.info(f"UniFleet Fleet Brain connected to MQTT broker with result code {rc}")
        self.is_connected = True
        client.subscribe("unifleet/telemetry/#")

    def on_message(self, client, userdata, msg):
        try:
            topic = msg.topic
            payload = json.loads(msg.payload.decode("utf-8"))

            # Pass through vendor adapter
            normalized = adapter_factory.detect_and_normalize(topic, payload)

            # Invoke registered callbacks
            for cb in self.telemetry_callbacks:
                if asyncio.iscoroutinefunction(cb):
                    asyncio.create_task(cb(normalized))
                else:
                    cb(normalized)
        except Exception as e:
            logger.error(f"Error processing MQTT message on topic {msg.topic}: {e}")

    def publish_command(self, robot_id: str, command: str, params: Dict[str, Any] = None):
        if self.client and self.is_connected:
            topic = f"unifleet/commands/{robot_id}"
            payload = {
                "command": command,
                "params": params or {}
            }
            self.client.publish(topic, json.dumps(payload))

    async def start(self):
        try:
            self.client = mqtt.Client(client_id=settings.MQTT_CLIENT_ID, callback_api_version=mqtt.CallbackAPIVersion.VERSION2)
            self.client.on_connect = self.on_connect
            self.client.on_message = self.on_message
            self.client.connect(settings.MQTT_BROKER_HOST, settings.MQTT_BROKER_PORT, keepalive=60)
            self.client.loop_start()
            logger.info("UniFleet MQTT manager loop started.")
        except Exception as e:
            logger.warning(f"Could not connect Fleet Brain to MQTT broker ({e}).")

    def stop(self):
        if self.client:
            self.client.loop_stop()
            self.client.disconnect()

mqtt_manager = MQTTManager()
