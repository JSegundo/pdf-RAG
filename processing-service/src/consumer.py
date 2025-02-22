# Import required libraries
import pika  # RabbitMQ client library for Python
import json 
import os    # For accessing environment variables
from dotenv import load_dotenv  
from processor.extract import PDFExtractor 

load_dotenv()

class QueueConsumer:
    # Python constructor (similar to constructor in JS classes)
    def __init__(self):
        print("\n=== Initializing Queue Consumer ===")
        # Instance variables are defined with self. (similar to this. in JS)
        self.connection = None
        self.channel = None
        # os.getenv works like process.env in Node.js, second argument is default value
        self.queue_name = os.getenv('RABBITMQ_QUEUE_NAME', 'document_processing')
        self.rabbitmq_url = os.getenv('RABBITMQ_URL', 'amqp://localhost:5672')
        print(f"Queue Configuration:")
        print(f"- Queue Name: {self.queue_name}")
        print(f"- RabbitMQ URL: {self.rabbitmq_url}")
        
        # Create an instance of PDFExtractor
        self.pdf_extractor = PDFExtractor()
        # Simpler path handling
        self.uploads_dir = os.path.abspath(os.getenv('UPLOADS_DIR', '../server/uploads'))
        print(f"- Upload Directory: {self.uploads_dir}")
        print("=== Initialization Complete ===\n")

    def connect(self):
        # Python's try/except is similar to try/catch in JS
        try:
            print("\n=== Connecting to RabbitMQ ===")
            # Create connection to RabbitMQ
            self.connection = pika.BlockingConnection(
                pika.URLParameters(self.rabbitmq_url)
            )
            self.channel = self.connection.channel()
            # Ensure queue exists (similar to assertQueue in Node.js amqplib)
            self.channel.queue_declare(queue=self.queue_name, durable=True)
            print("✓ Successfully connected to RabbitMQ")
            print(f"✓ Queue '{self.queue_name}' is ready")
            print("=== Connection Setup Complete ===\n")
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

            job_id = data.get('jobId')
            file_path = data.get('filePath')  # This will be like 'uploads/some-uuid.pdf'
            print(f"- Job ID: {job_id}")
            print(f"- Original File Path: {file_path}")

            if not all([job_id, file_path]):
                raise ValueError("Missing required fields in message")

            # Get just the filename from the full path
            file_name = os.path.basename(file_path)  # Gets 'some-uuid.pdf' from 'uploads/some-uuid.pdf'
            
            # Create the full path using our uploads_dir
            full_path = os.path.join(self.uploads_dir, file_name)
            print(f"- Full File Path: {full_path}")
            
            print("Starting file processing...")
            # Pass the full path to the extractor
            extracted_text = self.pdf_extractor.extract(full_path)
            print("✓ File processing complete")
            print(f"Extracted Text Preview: {extracted_text[:100]}...")

            # Acknowledge successful processing
            # (similar to channel.ack in Node.js amqplib)
            ch.basic_ack(delivery_tag=method.delivery_tag)
            print("✓ Message acknowledged")
            print("=== Message Processing Complete ===\n")

        except Exception as e:
            print(f"✗ Error processing message: {e}")
            # Negative acknowledgment - return message to queue
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)
            print("✗ Message returned to queue")
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