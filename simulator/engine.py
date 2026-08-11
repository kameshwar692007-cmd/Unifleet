import asyncio
import json
import logging
import paho.mqtt.client as mqtt
from typing import Dict
from simulator.robots import SimulatedRobot
from app.config import settings

logger = logging.getLogger("unifleet.simulator")

class SimulatorEngine:
    def __init__(self):
        self.robots: Dict[str, SimulatedRobot] = {
            "R01": SimulatedRobot("R01", "Vendor Alpha", "Heavy Lifter AGV", start_node="N01"),
            "R02": SimulatedRobot("R02", "Vendor Alpha", "Heavy Lifter AGV", start_node="N02"),
            "R03": SimulatedRobot("R03", "Vendor Beta", "AGV Picker Unit", start_node="N03"),
            "R04": SimulatedRobot("R04", "Vendor Gamma", "AMR Tugger", start_node="N04"),
            "R05": SimulatedRobot("R05", "Vendor Gamma", "AMR Tugger", start_node="N05")
        }
        self.mqtt_client: Optional[mqtt.Client] = None
        self.is_running = False

    def on_connect(self, client, userdata, flags, rc, properties=None):
        logger.info(f"Simulator connected to MQTT broker with result code {rc}")
        # Subscribe to command topics
        for r_id in self.robots:
            client.subscribe(f"unifleet/commands/{r_id}")

    def on_message(self, client, userdata, msg):
        try:
            topic = msg.topic
            payload = json.loads(msg.payload.decode("utf-8"))
            robot_id = topic.split("/")[-1]
            robot = self.robots.get(robot_id)
            if not robot:
                return

            cmd_type = payload.get("command")
            params = payload.get("params", {})

            if cmd_type == "ASSIGN_ROUTE":
                route = params.get("route", [])
                job_id = params.get("job_id")
                robot.set_route(route, job_id)
                logger.info(f"Robot {robot_id} assigned route: {route}")
            elif cmd_type == "PAUSE":
                robot.is_manual_paused = True
                robot.status = "PAUSED"
                logger.info(f"Robot {robot_id} PAUSED")
            elif cmd_type == "RESUME":
                robot.is_manual_paused = False
                if robot.route:
                    robot.status = "MOVING"
                else:
                    robot.status = "AVAILABLE"
                logger.info(f"Robot {robot_id} RESUMED")
            elif cmd_type == "STOP":
                robot.route = []
                robot.target_node = None
                robot.status = "AVAILABLE"
                robot.is_manual_paused = False
                logger.info(f"Robot {robot_id} STOPPED")
            elif cmd_type == "SET_BATTERY":
                robot.battery = float(params.get("battery", 15.0))
                logger.info(f"Robot {robot_id} battery forced to {robot.battery}%")
            elif cmd_type == "SET_OFFLINE":
                robot.status = "OFFLINE"
                logger.info(f"Robot {robot_id} set to OFFLINE")
            elif cmd_type == "START_CHARGING":
                robot.status = "CHARGING"
                robot.target_node = params.get("charging_node", "N08")
                node_obj = topology.get_node(robot.target_node)
                if node_obj:
                    robot.x = node_obj.x
                    robot.y = node_obj.y
                    robot.current_node = robot.target_node
                logger.info(f"Robot {robot_id} starting CHARGING at {robot.target_node}")
        except Exception as e:
            logger.error(f"Simulator error handling command message: {e}")

    async def start(self):
        self.is_running = True
        try:
            self.mqtt_client = mqtt.Client(client_id="unifleet_simulator_engine", callback_api_version=mqtt.CallbackAPIVersion.VERSION2)
            self.mqtt_client.on_connect = self.on_connect
            self.mqtt_client.on_message = self.on_message
            self.mqtt_client.connect(settings.MQTT_BROKER_HOST, settings.MQTT_BROKER_PORT, keepalive=60)
            self.mqtt_client.loop_start()
            logger.info("Simulator MQTT client loop started.")
        except Exception as e:
            logger.warning(f"Simulator MQTT broker connection failed ({e}). Operating in direct internal event bus mode.")

        # Main tick loop
        dt = 0.25 # 250ms tick
        while self.is_running:
            for r_id, robot in self.robots.items():
                robot.tick(dt)
                raw_payload = robot.to_vendor_payload()

                # Publish vendor payload to topic
                vendor_key = robot.vendor.lower().replace(" ", "_")
                topic = f"unifleet/telemetry/{vendor_key}/{robot.robot_id}"

                if self.mqtt_client and self.mqtt_client.is_connected():
                    self.mqtt_client.publish(topic, json.dumps(raw_payload))

            await asyncio.sleep(dt)

    def stop(self):
        self.is_running = False
        if self.mqtt_client:
            self.mqtt_client.loop_stop()
            self.mqtt_client.disconnect()

simulator_engine = SimulatorEngine()
