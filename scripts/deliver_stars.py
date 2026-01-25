
import sys
import json
import asyncio
import logging

# Configure logging to stderr so it doesn't pollute stdout (JSON)
logging.basicConfig(stream=sys.stderr, level=logging.INFO)

try:
    from tonutils.client import TonapiClient
    from tonutils.wallet import WalletV4R2
except ImportError:
    # Auto-install if missing (like in the original plugin)
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "tonutils"])
    from tonutils.client import TonapiClient
    from tonutils.wallet import WalletV4R2

async def main():
    try:
        # Read args
        # 1: API Key
        # 2: Mnemonic (string)
        # 3: Destination Address
        # 4: Amount (float)
        # 5: Comment
        
        if len(sys.argv) < 6:
            print(json.dumps({"success": False, "error": "Not enough arguments"}))
            return

        api_key = sys.argv[1]
        mnemonic_str = sys.argv[2]
        dest_addr = sys.argv[3]
        amount = float(sys.argv[4])
        comment = sys.argv[5]

        # Init Client
        client = TonapiClient(api_key=api_key)
        
        # Init Wallet
        # tonutils automatically handles stateInit (deployment) if needed
        wallet, _, _, _ = WalletV4R2.from_mnemonic(client, mnemonic_str.split(' '))
        
        # Check Balance
        # balance_nano = await wallet.get_balance() 
        # Actually tonutils wallet wrapper might handle this, but let's just try to send.
        # The library handles seqno and balance checks typically or throws error.

        logging.info(f"Sending {amount} TON to {dest_addr}...")
        
        tx_hash = await wallet.transfer(
            destination=dest_addr,
            amount=amount,
            body=comment,
        )

        print(json.dumps({"success": True, "txHash": tx_hash}))

    except Exception as e:
        # Print JSON error to stdout so Node.js can parse it
        print(json.dumps({"success": False, "error": str(e)}))
        # Also log to stderr
        logging.error(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
