from abc import ABC, abstractmethod
from typing import Dict, Any

class BaseRobotAdapter(ABC):
    @property
    @abstractmethod
    def vendor_name(self) -> str:
        pass

    @abstractmethod
    def normalize_telemetry(self, raw_payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Takes raw vendor payload and converts it into UniFleet Normalized Telemetry dictionary:
        {
            "robot_id": str,
            "vendor": str,
            "battery": float, (0.0 to 100.0)
            "status": str, (AVAILABLE, ASSIGNED, MOVING, WAITING, PAUSED, CHARGING, ERROR, OFFLINE)
            "x": float,
            "y": float,
            "current_node": str,
            "raw_payload": dict
        }
        """
        pass

    @abstractmethod
    def format_command(self, robot_id: str, command_type: str, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Translates UniFleet unified command (PAUSE, RESUME, STOP, NAVIGATE) into vendor raw payload format.
        """
        pass
