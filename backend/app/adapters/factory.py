from typing import Dict, Any, Optional
from app.adapters.base import BaseRobotAdapter
from app.adapters.vendor_alpha import VendorAlphaAdapter
from app.adapters.vendor_beta import VendorBetaAdapter
from app.adapters.vendor_gamma import VendorGammaAdapter
from app.adapters.vendor_delta import VendorDeltaAdapter

class AdapterFactory:
    def __init__(self):
        self.adapters: Dict[str, BaseRobotAdapter] = {}
        self.register_adapter(VendorAlphaAdapter())
        self.register_adapter(VendorBetaAdapter())
        self.register_adapter(VendorGammaAdapter())
        self.register_adapter(VendorDeltaAdapter())

    def register_adapter(self, adapter: BaseRobotAdapter):
        """
        Plugs in a new vendor adapter into UniFleet without modifying core Fleet Brain logic.
        """
        self.adapters[adapter.vendor_name] = adapter

    def get_adapter_by_name(self, vendor_name: str) -> Optional[BaseRobotAdapter]:
        return self.adapters.get(vendor_name)

    def detect_and_normalize(self, topic: str, raw_payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Detects vendor from MQTT topic or payload keys and passes through the normalized adapter.
        """
        if not isinstance(raw_payload, dict):
            raw_payload = {}

        topic_lower = topic.lower()
        if "delta" in topic_lower or "device_guid" in raw_payload or "charge_percent" in raw_payload:
            return self.adapters["Vendor Delta"].normalize_telemetry(raw_payload)
        elif "alpha" in topic_lower or "unit" in raw_payload or "pos" in raw_payload:
            return self.adapters["Vendor Alpha"].normalize_telemetry(raw_payload)
        elif "beta" in topic_lower or "soc" in raw_payload or "coordinates" in raw_payload:
            return self.adapters["Vendor Beta"].normalize_telemetry(raw_payload)
        elif "gamma" in topic_lower or "b_lvl" in raw_payload or "op_state" in raw_payload:
            return self.adapters["Vendor Gamma"].normalize_telemetry(raw_payload)
        else:
            return self.adapters["Vendor Alpha"].normalize_telemetry(raw_payload)

adapter_factory = AdapterFactory()
