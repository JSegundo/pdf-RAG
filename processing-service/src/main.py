from queue_consumer import QueueConsumer
import time
import sys

def main():
    max_retries = 5
    retry_delay = 5  # seconds
    attempt = 0

    while attempt < max_retries:
        try:
            print(f"\n=== Starting Processing Service (Attempt {attempt + 1}/{max_retries}) ===")
            consumer = QueueConsumer()
            consumer.connect()
            consumer.start_consuming()
            break  # If we get here, everything worked
        except Exception as e:
            attempt += 1
            print(f"✗ Attempt {attempt} failed: {e}")
            if attempt < max_retries:
                print(f"Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
            else:
                print("✗ Max retries reached. Exiting.")
                sys.exit(1)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n=== Service Shutdown Requested ===")
        sys.exit(0)
    except Exception as e:
        print(f"\n✗ Fatal error: {e}")
        sys.exit(1) 