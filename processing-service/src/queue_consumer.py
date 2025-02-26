# Import required libraries
import pika  # RabbitMQ client library for Python
import json 
import os    # For accessing environment variables
from dotenv import load_dotenv  
from process_pipeline.processor import DocumentProcessor

load_dotenv()

class QueueConsumer:
    def __init__(self):
        print("\n=== Initializing Queue Consumer ===")
        # Queue setup
        self.connection = None
        self.channel = None
        self.queue_name = os.getenv('RABBITMQ_QUEUE_NAME', 'document_processing')
        self.rabbitmq_url = os.getenv('RABBITMQ_URL', 'amqp://localhost:5672')
        
        # Database configuration
        self.db_config = {
            'dbname': os.getenv('POSTGRES_DB', 'postgres'),
            'user': os.getenv('POSTGRES_USER', 'postgres'),
            'password': os.getenv('POSTGRES_PASSWORD', 'yourpassword'),
            'host': os.getenv('POSTGRES_HOST', 'postgres'),
            'port': os.getenv('POSTGRES_PORT', '5432')
        }
        
        # Initialize document processor
        self.processor = DocumentProcessor(self.db_config)
        
        # File paths
        self.uploads_dir = os.path.abspath(os.getenv('UPLOADS_DIR', '../server/uploads'))
        
        print(f"Configuration:")
        print(f"- Queue Name: {self.queue_name}")
        print(f"- RabbitMQ URL: {self.rabbitmq_url}")
        print(f"- Upload Directory: {self.uploads_dir}")
        print("=== Initialization Complete ===\n")

    def connect(self):
        # Python's try/except is similar to try/catch in JS
        try:
            print("\n=== Connecting to RabbitMQ ===")
            self.connection = pika.BlockingConnection(
                pika.URLParameters(self.rabbitmq_url)
            )
            self.channel = self.connection.channel()
            # Ensure queue exists (similar to assertQueue in Node.js amqplib)
            self.channel.queue_declare(queue=self.queue_name, durable=True)
            print("✓ Successfully connected to RabbitMQ")
        except Exception as e:  # 'as' assigns the exception object to variable e
            print(f"✗ Error connecting to RabbitMQ: {e}")
            raise  # Re-raise the exception (similar to throw in JS)

    # Method that processes each message from the queue
    # ch, method, properties are RabbitMQ specific parameters
    # body contains the actual message data
    def process_message(self, ch, method, properties, body):
        try:
            print("\n=== Processing New Message ===")
            data = json.loads(body)
            print(f"Received message data: {data}")

            # Extract message data
            job_id = data.get('jobId')
            file_path = data.get('filePath')
            retries = data.get('retries', 0)
            metadata = data.get('metadata', {})  # Additional metadata from message
            
            print(f"- Job ID: {job_id}")
            print(f"- Original File Path: {file_path}")
            print(f"- Retry Attempt: {retries}")

            # Validate required fields
            if not all([job_id, file_path]):
                print("✗ Missing required fields - rejecting message")
                ch.basic_reject(delivery_tag=method.delivery_tag, requeue=False)
                return

            # Check max retries
            if retries >= 3:
                print("✗ Max retries reached - rejecting message")
                ch.basic_reject(delivery_tag=method.delivery_tag, requeue=False)
                return

            # Get full file path
            file_name = os.path.basename(file_path)
            full_path = os.path.join(self.uploads_dir, file_name)
            print(f"- Full File Path: {full_path}")
            
            # Add job info to metadata
            metadata.update({
                'job_id': job_id,
                'original_filename': file_name
            })
            
            # Process document through pipeline
            result = self.processor.process_document(
                file_path=full_path,
                metadata=metadata
            )
            
            print(f"✓ Document processing complete:")
            print(f"  - Title: {result['document_info']['title']}")
            print(f"  - Chunks: {result['document_info']['num_chunks']}")
            
            # TODO: store the job result in a database
            # or send a notification back to your Node.js server
            
            ch.basic_ack(delivery_tag=method.delivery_tag)
            print("✓ Message acknowledged")
            print("=== Message Processing Complete ===\n")

        except Exception as e:
            print(f"✗ Error processing message: {e}")
            # Handle retries
            data['retries'] = retries + 1
            if retries < 3:
                print(f"✗ Retrying message (attempt {retries + 1}/3)")
                self.channel.basic_publish(
                    exchange='',
                    routing_key=self.queue_name,
                    body=json.dumps(data)
                )
            ch.basic_reject(delivery_tag=method.delivery_tag, requeue=False)
            print("✗ Original message rejected")
            print("=== Message Processing Failed ===\n")
    def start_consuming(self):
        try:
            print("\n=== Starting Consumer ===")
            # Set how many messages to process at once
            self.channel.basic_qos(prefetch_count=1)
            print("✓ QoS prefetch set to 1")
            # Start consuming messages from the queue
            self.channel.basic_consume(
                queue=self.queue_name,
                on_message_callback=self.process_message  # Function to call for each message
            )
            print(f"✓ Consuming from queue: {self.queue_name}")
            print("=== Consumer Ready ===\n")
            
            print("Waiting for messages... (Press CTRL+C to exit)")
            # Start the consumer (blocks the thread until stopped)
            self.channel.start_consuming()
        except KeyboardInterrupt:  # Handle Ctrl+C
            print("\n=== Shutting Down Consumer ===")
            self.channel.stop_consuming()
        finally:  # Always executed (similar to finally in JS)
            if self.connection:
                self.connection.close()
                print("✓ Connection closed")
                print("=== Shutdown Complete ===\n") 