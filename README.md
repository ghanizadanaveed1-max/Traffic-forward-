# gcp-vps-forward

Cloud Run WebSocket relay that forwards to a VPS running the Ghanizada HAProxy edge stack.

Env vars: TARGET_HOST (required), TARGET_PORT (443), TARGET_TLS (1), TARGET_SNI, HOST_OVERRIDE.

Deploy:
gcloud run deploy ghqnizada --source . --region us-central1 --platform managed --allow-unauthenticated --cpu 1 --memory 128Mi --min-instances 0 --max-instances 3 --timeout 3600 --cpu-boost --session-affinity --set-env-vars TARGET_HOST=YOUR_VPS_IP,TARGET_PORT=443,TARGET_TLS=1 --quiet

Paths: "/" = SSH and OpenVPN (TCP); "/<port>/..." = local V2Ray inbound on the VPS.
