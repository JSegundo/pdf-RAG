import requests
import os
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class StatusNotifier:
    """Client for sending status updates to the API server"""
    
    def __init__(self):
        self.api_url = os.environ.get('API_SERVER_URL', 'http://localhost:3000')
        self.api_key = os.environ.get('INTERNAL_API_KEY', 'development_key')
    
    def send_notification(self, file_id: str, status: str, metadata: Optional[Dict[str, Any]] = None) -> bool:
        print(f'will send_notification: {status}')
        """
        Send a status notification to the API server
        
        Args:
            file_id: The ID of the file being processed
            status: Current status (processing, completed, failed)
            metadata: Additional information about the status
            
        Returns:
            bool: Whether the notification was sent successfully
        """
        try:
            logger.info(f"Sending {status} notification for file {file_id}")
            print(f"API URL: {self.api_url}")

            response = requests.post(
                f"{self.api_url}/api/notifications/internal/notify",
                json={
                    "fileId": file_id,
                    "status": status,
                    "metadata": metadata or {}
                },
                headers={
                    "Content-Type": "application/json",
                    "x-internal-api-key": self.api_key
                },
                timeout=5
            )
            
            if response.status_code != 200:
                logger.error(f"Failed to send notification: {response.status_code} - {response.text}")
                return False
                
            return True
        except Exception as e:
            logger.error(f"Exception sending notification: {e}")
            return False