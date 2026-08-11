from typing import Dict, Any, Optional
from app.adapters.base import BaseRobotAdapter
from app.adapters.vendor_alpha import VendorAlphaAdapter
from app.adapters.vendor_beta import VendorBetaAdapter
from app.adapters.vendor_gamma import VendorGammaAdapter

class AdapterFactory:
    def __init__(self):
        self.adapters: Dict[str, BaseRobotAdapter] = {
            "Vendor Alpha": VendorAlphaAdapter(),
            "Vendor Beta": VendorBetaAdapter(),
            "Vendor Gamma": VendorGammaAdapter()
        }

    def get_adapter_by_name(self, vendor_name: str) -> Optional[BaseRobotAdapter]:
        return self.adapters.get(vendor_name)

    def detect_and_normalize(self, topic: str, raw_payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Detects vendor from MQTT topic (e.g. unifleet/telemetry/alpha/R01) or payload keys.
        """
        topic_lower = topic.lower()
        if "alpha" in topic_lower or "unit" in raw_payload or "pos" in raw_payload:
            return self.adapters["Vendor Alpha"].normalize_telemetry(raw_payload)
        elif "beta" in topic_lower or "soc" in raw_payload or "coordinates" in raw_payload:
            return self.adapters["Vendor Beta"].normalize_telemetry(raw_payload)
        elif "gamma" in topic_lower or "b_lvl" in raw_payload or "op_state" in raw_payload:
            return self.adapters["Vendor Gamma"].normalize_telemetry(raw_payload)
        else:
            # Fallback to Vendor Alpha parsing format
            return self.adapters["Vendor Alpha"].normalize_telemetry(raw_payload)

adapter_factory = AdapterFactory()
